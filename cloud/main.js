require("./emails.js"); // allows email-specific could functions to be defined
require("./utility.js"); // utility functions which don't belong in the main file

// This function will call save on every book. This is useful for
// applying the functionality in beforeSaveBook to every book,
// particularly updating the tags and search fields.
Parse.Cloud.define("saveAllBooks", async (request) => {
    request.log.info("saveAllBooks - Starting.");
    // Query for all books
    var query = new Parse.Query("books");
    query.select("objectId");
    await query.each((book) => {
        book.set("updateSource", "saveAllBooks"); // very important that we don't leave updateSource unset so we don't add system:incoming tag
        try {
            return book.save(null, { useMasterKey: true });
        } catch (error) {
            request.log.error("saveAllBooks - book.save failed: " + error);
        }
    });
    request.log.info("saveAllBooks - Completed successfully.");
});

// March 2024, we made the following fields have a default value so
// we could increase the efficiency of our queries.
// This function finds all the books which need to be updated
// to have the default value and updates them.
Parse.Cloud.define("updateDefaultBooleans", async (request) => {
    request.log.info("updateDefaultBooleans - Starting.");

    async function doUpdate(fieldName, defaultValue) {
        var query = new Parse.Query("books");
        query.doesNotExist(fieldName);
        query.select("objectId");
        await query.each((book) => {
            book.set(fieldName, defaultValue);
            book.set("updateSource", "updateDefaultBooleans"); // very important that we don't leave updateSource unset so we don't add system:incoming tag
            try {
                return book.save(null, { useMasterKey: true });
            } catch (error) {
                request.log.error(
                    "updateDefaultBooleans - book.save failed: " + error
                );
            }
        });
    }

    await doUpdate("inCirculation", true);
    await doUpdate("rebrand", false);
    await doUpdate("draft", false);

    request.log.info("updateDefaultBooleans - Completed successfully.");
});

// A background job to populate usageCounts for languages.
// Also delete any unused language records (previously a separate job: removeUnusedLanguages).
// (tags processing was removed 4/2020 because we don't use the info)
//
// This is scheduled on Azure under bloom-library-maintenance-{prod|dev}-daily.
// You can also run it manually via REST:
// curl -X POST -H "X-Parse-Application-Id: <app ID>" -H "X-Parse-Master-Key: <master key>" -d "{}" https://bloom-parse-server-develop.azurewebsites.net/parse/jobs/updateLanguageRecords
Parse.Cloud.job("updateLanguageRecords", async (request) => {
    request.log.info("updateLanguageRecords - Starting.");

    const langCounts = {};
    const languagesToDelete = new Array();
    const languageIdsUsedByUncountedBooks = new Set();

    //Make and execute book query
    const bookQuery = new Parse.Query("books");
    bookQuery.limit(1000000); // Default is 100. We want all of them.
    bookQuery.select("langPointers", "inCirculation", "draft", "rebrand");
    const books = await bookQuery.find();
    books.forEach((book) => {
        const { langPointers, inCirculation, draft, rebrand } = book.attributes;
        if (langPointers) {
            //Spin through each book's languages and increment usage count
            langPointers.forEach((langPtr) => {
                const id = langPtr.id;
                if (!(id in langCounts)) {
                    langCounts[id] = 0;
                }

                // We don't want out-of-circulation, draft, rebrand books to
                // count toward our usage number, but we must not delete
                // a language record that is used by a book, even if all
                // the books that use it are drafts or out of circulation.
                // So we keep track of possible such languages to prevent
                // deleting them below.
                if (inCirculation === false || draft === true || rebrand) {
                    languageIdsUsedByUncountedBooks.add(id);
                } else {
                    langCounts[id]++;
                }
            });
        }
    });

    const langQuery = new Parse.Query("language");
    langQuery.limit(1000000); // Default is 100. We want all of them.
    const languagesToUpdate = await langQuery.find();
    languagesToUpdate.forEach((language) => {
        const newUsageCount = langCounts[language.id] || 0;
        language.set("usageCount", newUsageCount);

        if (
            newUsageCount === 0 &&
            !languageIdsUsedByUncountedBooks.has(language.id) &&
            !isLanguageRecordNew(language)
        ) {
            languagesToDelete.push(language);
        }
    });

    // In theory, we could remove items in languagesToDelete from languagesToUpdate.
    // But there will be so few of them, it doesn't seem worth it.

    try {
        const successfulUpdates = await Parse.Object.saveAll(
            languagesToUpdate,
            {
                useMasterKey: true,
            }
        );
        request.log.info(
            `updateLanguageRecords - Updated usageCount for ${successfulUpdates.length} languages.`
        );

        if (languagesToDelete.length === 0) {
            request.log.info("updateLanguageRecords - Completed successfully.");
            request.message("Completed successfully.");
            return Promise.resolve();
        }

        const successfulDeletes = await Parse.Object.destroyAll(
            languagesToDelete,
            {
                useMasterKey: true,
            }
        );
        request.log.info(
            `updateLanguageRecords - Deleted ${
                successfulDeletes.length
            } languages which had no books: ${successfulDeletes.map(
                (lang) =>
                    `{objectId: ${lang.id}, isoCode: ${lang.get(
                        "isoCode"
                    )}, name: ${lang.get("name")}}`
            )}`
        );
    } catch (error) {
        if (error.code === Parse.Error.AGGREGATE_ERROR) {
            error.errors.forEach((iError) => {
                request.log.error(
                    `Couldn't process ${iError.object.id} due to ${iError.message}`
                );
            });
            request.log.error(
                "updateLanguageRecords - Terminated unsuccessfully."
            );
            throw new Error("Terminated unsuccessfully.");
        } else {
            request.log.error(
                "updateLanguageRecords - Terminated unsuccessfully with error: " +
                    error
            );
            throw new Error("Terminated unsuccessfully with error: " + error);
        }
    }

    request.log.info("updateLanguageRecords - Completed successfully.");
    request.message("Completed successfully.");
});

// A background job to populate the analytics_* fields in our books table
// from api.bloomlibrary.org/stats. Data comes from our postgresql analytics database populated from Segment.
//
// This is scheduled on Azure under bloom-library-maintenance-{prod|dev}-daily.
// You can also run it manually via REST:
// curl -X POST -H "X-Parse-Application-Id: <app ID>" -H "X-Parse-Master-Key: <master key>" -d "{}" https://bloom-parse-server-develop.azurewebsites.net/parse/jobs/updateBookAnalytics
Parse.Cloud.job("updateBookAnalytics", async (request) => {
    request.log.info("updateBookAnalytics - Starting.");

    // api.bloomlibrary.org/stats looks up analytics based on a parse server query.
    // The api needs the appropriate parse server url and key so it can call back to the right parse server
    // instance to get the list of books we want data about from the postgresql database.
    function getCurrentInstanceInfoForApiQuery() {
        return {
            url: process.env.SERVER_URL,
            appId: process.env.APP_ID,
        };
        // But when testing locally, you need to explicitly set which environment you want
        // to collect analytics data for. You'll need to override using something like
        // return {
        //     url: "https://dev-server.bloomlibrary.org/parse",
        //     appId: "yrXftBF6mbAuVu3fO6LnhCJiHxZPIdE7gl1DUVGR",
        // };
    }
    function getNumberOrZero(value, isDecimal = false) {
        if (!value) return 0;

        if (isDecimal) {
            const number = parseFloat(value);
            return isNaN(number) ? 0 : number;
        }

        const number = parseInt(value, 10);
        return isNaN(number) ? 0 : number;
    }
    // key/value pairs of column names to analytics results metadata
    const analyticsColumnsMap = {
        analytics_startedCount: {
            apiResultName: "started",
        },
        analytics_finishedCount: {
            apiResultName: "finished",
        },
        analytics_shellDownloads: {
            apiResultName: "shelldownloads",
        },
        analytics_pdfDownloads: {
            apiResultName: "pdfdownloads",
        },
        analytics_epubDownloads: {
            apiResultName: "epubdownloads",
        },
        analytics_bloompubDownloads: {
            apiResultName: "bloompubdownloads",
        },
        analytics_questionsInBookCount: {
            apiResultName: "numquestionsinbook",
        },
        analytics_quizzesTakenCount: {
            apiResultName: "numquizzestaken",
        },
        analytics_meanQuestionsCorrectPct: {
            apiResultName: "meanpctquestionscorrect",
            isDecimal: true,
        },
        analytics_medianQuestionsCorrectPct: {
            apiResultName: "medianpctquestionscorrect",
            isDecimal: true,
        },
    };

    try {
        const bloomApiUrl = "https://api.bloomlibrary.org/v1";
        // "http://127.0.0.1:7071/v1"; // testing with a locally-run api

        // Query the api for per-books stats for all books.
        // What is going on behind the scenes is actually somewhat convoluted.
        // We give the api the query to run to get the parse books.
        // It sends that list of books to the postgresql database to get the analytics data
        // and returns it to us. It would be more efficient to ask the postgresql database
        // ourselves, but the api endpoint already exists, and I didn't want to provide
        // postgres connection information to the parse server.
        const axios = require("axios");
        const analyticsResults = await axios.post(
            `${bloomApiUrl}/stats/reading/per-book`,
            {
                filter: {
                    parseDBQuery: {
                        url: `${
                            getCurrentInstanceInfoForApiQuery().url
                        }/classes/books`,
                        method: "GET",
                        options: {
                            headers: {
                                "X-Parse-Application-Id": `${
                                    getCurrentInstanceInfoForApiQuery().appId
                                }`,
                            },
                            params: {
                                limit: 1000000, // Default is 100. We want all of them.
                                keys: "objectId,bookInstanceId",
                            },
                        },
                    },
                },
            }
        );
        const analyticsSourceData = analyticsResults.data.stats;

        // Make a map of bookInstanceId to analytics data for efficiency
        const bookInstanceIdToAnalyticsMap = {};
        analyticsSourceData.forEach((bookAnalytics) => {
            bookInstanceIdToAnalyticsMap[bookAnalytics.bookinstanceid] =
                bookAnalytics;
        });

        // Get all the books in our parse database.
        // If the analytics values need to be updated, push it into
        // a new array of books to update.
        const booksToUpdate = [];
        const bookQuery = new Parse.Query("books");
        bookQuery.limit(1000000); // Default is 100. We want all of them.
        bookQuery.select("bookInstanceId", ...Object.keys(analyticsColumnsMap));

        const allBooks = await bookQuery.find();
        allBooks.forEach((book) => {
            const bookAnalytics =
                bookInstanceIdToAnalyticsMap[book.get("bookInstanceId")];

            let bookNeedsUpdate = false;
            Object.keys(analyticsColumnsMap).forEach((columnName) => {
                const newValue = getNumberOrZero(
                    bookAnalytics?.[
                        analyticsColumnsMap[columnName].apiResultName
                    ],
                    analyticsColumnsMap[columnName].isDecimal || false
                );

                if (book.get(columnName) !== newValue) {
                    book.set(columnName, newValue);
                    bookNeedsUpdate = true;
                }
            });
            if (bookNeedsUpdate) {
                // Important to set updateSource for proper processing in beforeSave (see details there).
                book.set("updateSource", "updateBookAnalytics");

                booksToUpdate.push(book);
            }
        });

        //Save any books with updated analytics.
        const successfulUpdates = await Parse.Object.saveAll(booksToUpdate, {
            useMasterKey: true,
        });
        request.log.info(
            `updateBookAnalytics - Updated analytics for ${successfulUpdates.length} books.`
        );
    } catch (error) {
        if (error.code === Parse.Error.AGGREGATE_ERROR) {
            const maxErrors = 20; // Don't blow up the log.
            for (let i = 0; i < error.errors.length && i < maxErrors; i++) {
                const iError = error.errors[i];
                request.log.error(
                    `Couldn't process ${iError.object.id} due to ${iError.message}`
                );
            }
            if (error.errors.length > maxErrors) {
                request.log.error(
                    `${
                        error.errors.length - maxErrors
                    } more errors were suppressed.`
                );
            }
            request.log.error(
                "updateBookAnalytics - Terminated unsuccessfully."
            );
            throw new Error("Terminated unsuccessfully.");
        } else {
            request.log.error(
                "updateBookAnalytics - Terminated unsuccessfully with error: " +
                    error
            );
            throw new Error("Terminated unsuccessfully with error: " + error);
        }
    }

    request.log.info("updateBookAnalytics - Completed successfully.");
    request.message("Completed successfully.");
});

// We are trying to determine if we should delete a language record
// which is not in use. But we also don't want to delete something which was newly created
// and for which the corresponding book record has not yet been created. See BL-11818.
// So, for now we'll define "new" as within two hours. Probably could safely be one.
function isLanguageRecordNew(language) {
    const twoHoursAgo = new Date();
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
    return language.createdAt > twoHoursAgo;
}

// Function for cleaning out the tag table of unused tags.
// You can run it manually via REST:
// curl -X POST -H "X-Parse-Application-Id: <app ID>" -H "X-Parse-Master-Key: <master key>" -d "{}" https://bloom-parse-server-develop.azurewebsites.net/parse/functions/removeUnusedTags
Parse.Cloud.define("removeUnusedTags", async (request) => {
    request.log.info("removeUnusedTags - Starting.");
    const tagCounts = {};
    //Query each tag
    const tagQuery = new Parse.Query("tag");
    tagQuery.limit(1000000); // default is 100, supposedly. We want all of them.
    const tags = await tagQuery.find();
    tags.forEach((tag) => {
        tagCounts[tag.get("name")] = 0;
    });
    //Create a book query
    const bookQuery = new Parse.Query("books");
    bookQuery.limit(1000000); // default is 100, supposedly. We want all of them.
    bookQuery.select("tags");
    const books = await bookQuery.find();
    books.forEach((book) => {
        var bookTags = book.get("tags");
        if (bookTags && bookTags.length) {
            bookTags.forEach((tagName) => {
                if (tagName.indexOf(":") < 0) {
                    // In previous versions of Bloom, topics came in without the "topic:" prefix
                    tagName = "topic:" + tagName;
                }
                if (tagName in tagCounts) {
                    tagCounts[tagName]++;
                }
            });
        }
    });
    const retval = [];
    let errorCount = 0;
    for (const tag of tags) {
        const tagName = tag.get("name");
        const count = tagCounts[tagName];
        if (count === 0) {
            try {
                await tag.destroy({ useMasterKey: true });
                retval.push(`removed unused tag "${tagName}"`);
            } catch (error) {
                retval.push(
                    `failed to remove unused tag "${tagName}": ${error}`
                );
                ++errorCount;
            }
        }
    }
    if (errorCount === 0)
        request.log.info("removeUnusedTags - Completed successfully.");
    else
        request.log.info(
            `removeUnusedTags - Completed with ${errorCount} errors removing tags.`
        );
    if (retval.length === 0) return "There were no unused tags.";
    return retval;
});

// Prevent bogus records. See BL-11123.
function basicBookValidationRules(request) {
    const book = request.object;
    if (
        !book.get("title") ||
        !book.get("bookInstanceId") ||
        !book.get("uploader")
    ) {
        request.log.warn(
            `books beforeSave trigger prevented book save; inadequate data for saving book: ${JSON.stringify(
                request
            )}`
        );
        throw "invalid data";
    }
}

function updateHasBloomPub(book) {
    // Mirrors the behavior of BloomLibrary's ArtifactVisibilitySettings decision() method
    // applied to the bloomReader settings to determine whether the book has a bloomPUB
    // generated by the harvester which may appropriately be downloaded.
    // Basically, if the harvester made one at all, the user (uploader) opinion of it
    // beats the librarian opinion which beats the harvester's own opinion, depending on which
    // of these is actually recorded.
    const show = book.get("show");
    let readerSettings = show && show.bloomReader;
    let hasBloomPub = false;
    if (readerSettings && readerSettings.exists !== false) {
        if (readerSettings.user !== undefined) {
            hasBloomPub = readerSettings.user;
        } else if (readerSettings.librarian !== undefined) {
            hasBloomPub = readerSettings.librarian;
        } else {
            hasBloomPub = readerSettings.harvester !== false;
        }
    }
    book.set("hasBloomPub", hasBloomPub);
}

// Makes new and updated books have the right search string and ACL.
Parse.Cloud.beforeSave(
    "books",
    function (request) {
        // console.log("entering bloom-parse-server main.js beforeSave books");

        const book = request.object;
        updateHasBloomPub(book);

        // The original purpose of the updateSource field was so we could set system:Incoming on every book
        // when it is uploaded or reuploaded from BloomDesktop without doing so for changes from the datagrid.
        //
        // Now, we also use it to set harvestState to "New" or "Updated" depending on if the book record is new.
        //
        // We also set lastUploaded for old (pre-4.7) BloomDesktops which don't set it themselves.
        let newUpdateSource = book.get("updateSource");
        // Apparently, "dirty" just means we provided it, regardless of whether or not it changed.
        // Careful not to use book.dirty("updateSource") which seems to always be true.
        if (!book.dirtyKeys().includes("updateSource")) {
            // For old BloomDesktops which didn't set the updateSource, we use this hack
            if (
                request.headers["user-agent"] &&
                request.headers["user-agent"].startsWith("RestSharp")
            ) {
                newUpdateSource = "BloomDesktop old";
                book.set("lastUploaded", {
                    __type: "Date",
                    iso: new Date().toISOString(),
                });
            }
            // direct change on the dashboard (either using "Browser" view or "API Console")
            else if (
                request.headers.referer &&
                request.headers.referer.indexOf(
                    "dashboard/apps/BloomLibrary.org"
                ) > -1
            ) {
                newUpdateSource = "parse dashboard";
            }
            // someone forgot to set updateSource
            else {
                newUpdateSource = "unknown";
            }
            book.set("updateSource", newUpdateSource);
        }
        // As of April 2020, BloomDesktop 4.7 now sets the updateSource to "BloomDesktop {version}".
        // In Bloom 5.6 (Oct 2023), we started uploading through an API.
        // For book updates, updateSource behaves as previously. But for new books,
        // the parse record creation is a two-step process. upload-start creates an empty record
        // with updateSource="BloomDesktop via API". Then upload-finish fills in the record
        // and includes updateSource="BloomDesktop {version} (new book)" so we can distinguish
        // that type of new-book update from a real update.
        if (newUpdateSource.startsWith("BloomDesktop")) {
            // Change came from BloomDesktop upload (or reupload)
            book.addUnique("tags", "system:Incoming");
            if (book.isNew() || newUpdateSource.endsWith("(new book)")) {
                book.set("harvestState", "New");
            } else {
                book.set("harvestState", "Updated");
            }

            // Prevent book uploads from overwriting certain fields changed by moderators
            if (request.original) {
                // These columns will not be overwritten unless the new book has truth-y values for them
                // For scalar columns (these are more straightforward than array columns)
                const scalarColumnsWithFallback = [
                    "summary",
                    "librarianNote",
                    "publisher",
                    "originalPublisher",
                    "publisherBookId",
                ];
                scalarColumnsWithFallback.forEach((columnName) => {
                    const newValue = book.get(columnName);
                    const originalValue = request.original.get(columnName);
                    if (!newValue && originalValue) {
                        book.set(columnName, originalValue);
                    }
                });

                // These columns are array columns, for which we want to preserve all the pre-existing values
                //
                // tags - For now, we don't bother enforcing that the prefix part (before the colon) is unique (keep it simple for now).
                //        If this is determined to be a requirement, then additional code needs to be added to handle that.
                const arrayColumnsToUnion = ["tags"];
                arrayColumnsToUnion.forEach((columnName) => {
                    const originalArrayValue = request.original.get(columnName);
                    if (originalArrayValue && originalArrayValue.length >= 1) {
                        book.addAllUnique(columnName, originalArrayValue);
                    }
                });

                // Features is able to be changed by moderators, but it's also computed by BloomDesktop. Even if it's empty, keep the BloomDesktop value.
                // My sense is that the auto-computed value is generally more likely to be correct than the value from the DB.
                // The user might've removed all the pages with that feature.
                //
                // langPointers can also be changed by moderators. But it's difficult to keep track of what languages a moderator removed
                // versus what is a newly added language. So for now, we'll live with not modifying langPointers.
            }
        }

        // Bloom 3.6 and earlier set the authors field, but apparently, because it
        // was null or undefined, parse.com didn't try to add it as a new field.
        // When we migrated from parse.com to parse server,
        // we started getting an error because uploading a book was trying to add
        // 'authors' as a new field, but it didn't have permission to do so.
        // In theory, we could just unset the field here:
        // request.object.unset("authors"),
        // but that doesn't prevent the column from being added, either.
        // Unfortunately, that means we simply had to add authors to the schema. (BL-4001)

        var tagsIncoming = book.get("tags");
        var search = (book.get("title") || "").toLowerCase();
        var index;
        const tagsOutput = [];
        if (tagsIncoming) {
            for (index = 0; index < tagsIncoming.length; ++index) {
                var tagName = tagsIncoming[index];
                var indexOfColon = tagName.indexOf(":");
                if (indexOfColon < 0) {
                    // From older versions of Bloom, topics come in without the "topic:" prefix
                    tagName = "topic:" + tagName;

                    indexOfColon = "topic:".length - 1;
                }
                tagsOutput.push(tagName);

                // We only want to put the relevant information from the tag into the search string.
                // i.e. for region:Asia, we only want Asia. We also exclude system tags.
                // Our current search doesn't handle multi-string searching, anyway, so even if you knew
                // to search for 'region:Asia' (which would never be obvious to the user), you would get
                // a union of 'region' results and 'Asia' results.
                // Other than 'system:', the prefixes are currently only used to separate out the labels
                // in the sidebar of the browse view.
                if (tagName.startsWith("system:")) continue;
                var tagNameForSearch = tagName.substr(indexOfColon + 1);
                search = search + " " + tagNameForSearch.toLowerCase();
            }
        }
        request.object.set("tags", tagsOutput);
        request.object.set("search", search);

        // Transfer bookLineage, which is a comma-separated string, into an array for better querying
        const bookLineage = book.get("bookLineage");
        let bookLineageArray = undefined;
        if (bookLineage) {
            bookLineageArray = bookLineage.split(",");
        }
        request.object.set("bookLineageArray", bookLineageArray);

        var creator = request.user;

        if (creator && request.object.isNew()) {
            // created normally, someone is logged in and we know who, restrict access
            var newACL = new Parse.ACL();
            // According to https://parse.com/questions/beforesave-user-set-permissions-for-self-and-administrators,
            // a user can always write their own object, so we don't need to permit that.
            newACL.setPublicReadAccess(true);
            newACL.setRoleWriteAccess("moderator", true); // allows moderators to delete
            newACL.setWriteAccess(creator, true);
            request.object.setACL(newACL);
        }
    },
    basicBookValidationRules
);

Parse.Cloud.afterSave("books", async (request) => {
    // Now that we have saved the book, see if there are any new tags we need to create in the tag table.
    var book = request.object;
    var Tag = Parse.Object.extend("tag");
    book.get("tags").forEach(async (name) => {
        const query = new Parse.Query(Tag);
        query.equalTo("name", name);

        try {
            const count = await query.count();
            if (count == 0) {
                // We have a tag on this book which doesn't exist in the tag table. Create it.
                var tag = new Tag();
                tag.set("name", name);
                await tag.save(null, { useMasterKey: true });
            }
        } catch (error) {
            // I'm not sure it is the right thing to do, but these errors
            // were getting ignored previously, so when I refactored the code,
            // I made it do the same.
            request.log.error(
                "afterSave - books, tag processing failed: " + error
            );
        }
    });

    // Send email if this book didn't exist before
    try {
        // this seemed to work locally, but not on the azure production server,
        // and has been the subject of many bug reports over the years
        //          objectExisted = request.object.existed();
        // so we are working around it this way:
        var createdAt = request.object.get("createdAt");
        var updatedAt = request.object.get("updatedAt");
        var objectExisted = createdAt.getTime() != updatedAt.getTime();

        const updateSource = book.get("updateSource");
        const shouldSendEmail =
            // Old style upload, direct from BloomDesktop
            (!objectExisted && updateSource !== "BloomDesktop via API") ||
            // New style upload, via the API
            updateSource.endsWith("(new book)");

        if (shouldSendEmail) {
            var emailer = require("./emails.js");
            await emailer.sendEmailAboutNewBookAsync(book);
            request.log.info("Book saved email notice sent successfully.");
        }
    } catch (error) {
        request.log.error(
            "ERROR: Book saved but sending notice email failed: " + error
        );
    }
});

// July 2025:
// The notes below were correct for a long time, and perhaps they still represent the current
// ideal since we have not yet taken the time to figure out to use schema files.
// But our more recent practice has been to cheat and just create fields manually in the dashboard.
// That is much easier because it doesn't require deploying the cloud code at all.
// In theory, we have also kept this function in sync with manual changes, but
// I'm guessing we have not done so perfectly.
// So it would probably be unsafe to run this on the live database now.
// I've created a new private repository at https://github.com/BloomBooks/bloom-parser-server-schema
// to hold schema files for each environment as of today. That at least documents where things are.
// And some day we should figure out how to make use of them to properly update the schema when we need to.
// End July 2025.
//
// This function is used to set up the fields used in the bloom library.
// Adding something here should be the ONLY way fields and classes are added to parse.com.
// After adding one, it is recommended that you first deploy the modified cloud code
// to a test project, run it, and verify that the result are as expected.
// Then try on the bloomlibrarysandbox (where you should also develop and test the
// functionality that uses the new fields).
// Finally deploy and run on the live database.
// For more information about deploying, see the main README.md.
//
// Currently this will not delete fields or tables; if you want to do that it will have to be
// by hand.
//
// Run this function from a command line like this (with the appropriate keys for the application inserted)
// curl -X POST -H "X-Parse-Application-Id: <App ID>" -H "X-Parse-Master-Key: <Master Key>" https://bloom-parse-server-production.azurewebsites.net/parse/functions/setupTables/
//
// Alternatively, you can use the parse server's dashboard's API Console to run the function:
// parsedashboard.bloomlibrary.org or dev-parsedashboard.bloomlibrary.org.
// Go to the API Console. type=POST, endpoint="functions/setupTables", useMasterKey=yes. Click Send Query.
//
// NOTE: There is reason to believe that using this function to add columns of type Object does not work
// and that they must be added manually (in the dashboard) instead.
Parse.Cloud.define("setupTables", async () => {
    // Required BloomLibrary classes/fields
    // Note: code below currently requires that 'books' is first.
    // Current code supports only String, Boolean, Number, Date, Array, Pointer<_User/Book/appDetailsInLanguage>,
    // and Relation<books/appDetailsInLanguage>.
    // It would be easy to generalize the pointer/relation code provided we can organize so that classes that are
    // the target of relations or pointers occur before the fields targeting them.
    // This is because the way we 'create' a field is to create an instance of the class that has that field.
    // These instances can also be conveniently used as targets when creating instances of classes
    // that refer to them.
    console.log("bloom-parse-server main.js define setupTables function");
    var classes = [
        {
            name: "version",
            fields: [{ name: "minDesktopVersion", type: "String" }],
        },
        {
            name: "books",
            fields: [
                { name: "allTitles", type: "String" },
                // For why the 'authors' field is needed, see http://issues.bloomlibrary.org/youtrack/issue/BL-4001
                { name: "authors", type: "Array" },
                { name: "baseUrl", type: "String" },
                { name: "bookInstanceId", type: "String" },
                { name: "bookLineage", type: "String" },
                { name: "bookOrder", type: "String" },
                { name: "bookletMakingIsAppropriate", type: "Boolean" },
                { name: "copyright", type: "String" },
                { name: "credits", type: "String" },
                { name: "currentTool", type: "String" },
                { name: "downloadCount", type: "Number" },
                { name: "downloadSource", type: "String" },
                { name: "experimental", type: "Boolean" },
                { name: "folio", type: "Boolean" },
                { name: "formatVersion", type: "String" },
                { name: "inCirculation", type: "Boolean" },
                { name: "draft", type: "Boolean" },
                { name: "isbn", type: "String" },
                { name: "keywords", type: "Array" },
                { name: "keywordStems", type: "Array" },
                { name: "langPointers", type: "Array" },
                { name: "languages", type: "Array" },
                { name: "librarianNote", type: "String" },
                { name: "license", type: "String" },
                { name: "licenseNotes", type: "String" },
                { name: "pageCount", type: "Number" },
                { name: "readerToolsAvailable", type: "Boolean" },
                { name: "search", type: "String" },
                { name: "show", type: "Object" },
                { name: "hasBloomPub", type: "Boolean" },
                { name: "suitableForMakingShells", type: "Boolean" },
                { name: "suitableForVernacularLibrary", type: "Boolean" },
                { name: "summary", type: "String" },
                { name: "tags", type: "Array" },
                { name: "thumbnail", type: "String" },
                { name: "title", type: "String" },
                { name: "originalTitle", type: "String" },
                { name: "tools", type: "Array" },
                { name: "updateSource", type: "String" },
                { name: "uploader", type: "Pointer<_User>" },
                { name: "lastUploaded", type: "Date" },
                { name: "leveledReaderLevel", type: "Number" },
                { name: "country", type: "String" },
                { name: "province", type: "String" },
                { name: "district", type: "String" },
                { name: "features", type: "Array" },
                // Name of the organization or entity that published this book.  It may be null if self-published.
                { name: "publisher", type: "String" },
                // When people make derivative works, that work is no longer "published" by the people who made
                // the shell book. So "publisher" might become empty, or might get a new organization. But we still
                // want to be able to acknowledge what org gave us this shellbook, and list it on their page
                // (indicating that this is a derived book that they are not responsible for). So ideally new
                // shellbooks that have a "publisher" also have that same value in "originalPublisher".
                // "originalPublisher" will never be cleared by BloomDesktop.
                { name: "originalPublisher", type: "String" },
                // The publisher's own identifier for this book (e.g. a catalog/SKU number the
                // publisher uses to track it). E.g. for StoryWeaver, "sw-1234". May be null.
                { name: "publisherBookId", type: "String" },
                // This is a "perceptual hash" (http://phash.org/) of the image in the first bloom-imageContainer
                // we find on the first page after any xmatter pages. We use this to suggest which books are
                // probably related to each other. This allows us to link, for example, books that are translations
                // of each other.  (https://www.nuget.org/packages/Shipwreck.Phash/ is used to calculate the phash.)
                { name: "phashOfFirstContentImage", type: "String" },
                // This is the name of the branding project assigned to the book. "Default" means that
                // there isn't any specific branding project assigned to the book.
                { name: "brandingProjectName", type: "String" },
                // BloomDesktop creates bookLineage as a comma-separated string.
                // But we need it to be an array for more complex querying.
                // So beforeSave on books converts it to an array in this field.
                { name: "bookLineageArray", type: "Array" },
                // Fields required by Harvester
                { name: "harvestState", type: "String" },
                { name: "harvesterId", type: "String" },
                { name: "harvesterMajorVersion", type: "Number" },
                { name: "harvesterMinorVersion", type: "Number" },
                { name: "harvestStartedAt", type: "Date" },
                { name: "harvestLog", type: "Array" },
                // End fields required by Harvester
                { name: "internetLimits", type: "Object" },
                { name: "importedBookSourceUrl", type: "String" },
                // Fields required by RoseGarden
                { name: "importerName", type: "String" },
                { name: "importerMajorVersion", type: "Number" },
                { name: "importerMinorVersion", type: "Number" },
                // End fields required by RoseGarden
                // rebrand is explained in BL-10865.
                { name: "rebrand", type: "Boolean" },
                // bloomPUBVersion is explained in BL-10720
                { name: "bloomPUBVersion", type: "Number" },
                { name: "bookHashFromImages", type: "String" }, // BL-14980

                // analytics_* fields are populated by the updateBookAnalytics job.
                { name: "analytics_startCount", type: "Number" },
                { name: "analytics_finishedCount", type: "Number" },
                { name: "analytics_shellDownloads", type: "Number" },
                { name: "analytics_pdfDownloads", type: "Number" },
                { name: "analytics_epubDownloads", type: "Number" },
                { name: "analytics_bloompubDownloads", type: "Number" },
                { name: "analytics_questionsInBookCount", type: "Number" },
                { name: "analytics_quizzesTakenCount", type: "Number" },
                { name: "analytics_meanQuestionsCorrectPct", type: "Number" },
                { name: "analytics_medianQuestionsCorrectPct", type: "Number" },
            ],
        },
        {
            name: "downloadHistory",
            fields: [
                { name: "bookId", type: "String" },
                { name: "userIp", type: "String" },
            ],
        },
        {
            name: "language",
            fields: [
                { name: "ethnologueCode", type: "String" },
                { name: "isoCode", type: "String" },
                { name: "name", type: "String" },
                { name: "englishName", type: "String" },
                //Usage count determined daily per Parse.com job
                { name: "usageCount", type: "Number" },
            ],
        },
        {
            name: "tag",
            fields: [{ name: "name", type: "String" }],
        },
        {
            name: "relatedBooks",
            fields: [{ name: "books", type: "Array" }],
        },
        {
            name: "appDetailsInLanguage",
            fields: [
                { name: "androidStoreLanguageIso", type: "String" },
                { name: "title", type: "String" },
                { name: "shortDescription", type: "String" },
                { name: "fullDescription", type: "String" },
            ],
        },
        {
            name: "appSpecification",
            fields: [
                { name: "bookVernacularLanguageIso", type: "String" },
                { name: "defaultStoreLanguageIso", type: "String" },
                { name: "buildEngineJobId", type: "String" },
                { name: "colorScheme", type: "String" },
                { name: "icon1024x1024", type: "String" },
                { name: "featureGraphic1024x500", type: "String" },
                { name: "details", type: "Relation<appDetailsInLanguage>" },
                { name: "owner", type: "Pointer<_User>" },
                { name: "packageName", type: "String" },
            ],
        },
        {
            // must come after the classes it references
            name: "booksInApp",
            fields: [
                { name: "app", type: "Pointer<appSpecification>" },
                { name: "book", type: "Pointer<books>" },
                { name: "index", type: "Integer" },
            ],
        },
    ];

    var ic = 0;
    var aUser = null;
    var aBook = null;
    var anApp = null;
    // If we're updating a 'live' table, typically we will have locked it down so
    // only with the master key can we add fields or classes.
    //Parse.Cloud.useMasterKey();

    var doOne = async () => {
        var className = classes[ic].name;
        var parseClass = Parse.Object.extend(className);
        var instance = new parseClass();
        var fields = classes[ic].fields;
        for (var ifld = 0; ifld < fields.length; ifld++) {
            var fieldName = fields[ifld].name;
            var fieldType = fields[ifld].type;
            switch (fieldType) {
                case "String":
                    instance.set(fieldName, "someString");
                    break;
                case "Date":
                    instance.set(fieldName, {
                        __type: "Date",
                        iso: "2015-02-15T00:00:00.000Z",
                    });
                    break;
                case "Boolean":
                    instance.set(fieldName, true);
                    break;
                case "Number":
                    instance.set(fieldName, 1);
                    break;
                case "Array":
                    instance.set(fieldName, ["one", "two"]);
                    break;
                case "Pointer<_User>":
                    instance.set(fieldName, aUser);
                    break;
                case "Pointer<books>":
                    // This and next could be generalized if we get a couple more. User would remain special.
                    instance.set(fieldName, aBook);
                    break;
                case "Pointer<appSpecification>":
                    instance.set(fieldName, anApp);
                    break;

                // It appears this is not used, so we're commenting it out for now. We're not sure if or how it was used previously.
                // case "Relation<books>":
                //     // This and next could be generalized if we have other kinds of relation one day.
                //     var target = aBook;
                //     var relation = instance.relation(fieldName);
                //     relation.add(target);
                //     break;
            }
        }
        const newObj = await instance.save(null, {
            useMasterKey: true,
        });

        // remember the new object so we can destroy it later, or use it as a relation target.
        classes[ic].parseObject = newObj;
        // if the class is one of the ones we reference in pointers or relations,
        // remember the appropriate instance for use in creating a sample.
        if (classes[ic].name == "books") {
            aBook = newObj;
        }
        ic++;
        if (ic < classes.length) {
            await doOne(); // recursive call to the main method to loop
        } else {
            // Start a new recursive iteration to delete the objects we don't need.
            ic = 0;
            await deleteOne();
        }
    };
    var deleteOne = async () => {
        // Now we're done, the class and fields must exist; we don't actually want the instances
        var newObj = classes[ic].parseObject;
        await newObj.destroy({
            useMasterKey: true,
        });

        ic++;
        if (ic < classes.length) {
            await deleteOne(); // recursive loop
        } else {
            await cleanup();
        }
    };
    var cleanup = async () => {
        // We've done the main job...now some details.
        var versionType = Parse.Object.extend("version");
        var query = new Parse.Query("version");
        const results = await query.find();

        var version;
        if (results.length >= 1) {
            // updating an existing project, already has version table and instance
            version = results[0];
        } else {
            version = new versionType();
        }
        version.set("minDesktopVersion", "2.0");
        await version.save(null, {
            useMasterKey: true,
        });

        // Finally destroy the spurious user we made.
        await aUser.destroy({
            useMasterKey: true,
        });
    };
    // Create a user, temporarily, which we will delete later.
    // While debugging I got tired of having to manually remove previous "temporary" users,
    // hence each is now unique.
    var rand = parseInt(Math.random() * 10000, 10);
    const newUser = await Parse.User.signUp(
        "zzDummyUserForSetupTables" + rand,
        "unprotected",
        { administrator: false }
    );
    aUser = newUser;
    await doOne(); // start the recursion.

    return "setupTables ran to completion.";
});

// This function expects to be passed params containing an id and JWT token
// from a successful firebase login. It looks for a parse-server identity whose
// username is that same ID. If it finds one without authData (which is how it links
// to the Firebase identity), it creates the authData.
// Otherwise, it does nothing...
// If there is no corresponding parse-server user, the client will
// subsequently call a POST to users which will create the parse-server user with authData.
// If there is a corresponding parse-server user with authData, the POST to users
// will log them in.
Parse.Cloud.define("bloomLink", async (request) => {
    let user;
    var id = request.params.id;
    //console.log(" bloomLink with request: " + JSON.stringify(request));
    const query = new Parse.Query("User");
    query.equalTo("username", id);
    const results = await query.find({ useMasterKey: true });
    if (results.length == 0) {
        // No existing user. Nothing to do.
        return "no existing user to link";
    } else {
        user = results[0];
    }

    // The following code saves authData corresponding to the current token.
    //console.log("bloomLink got user " + JSON.stringify(user));
    const token = request.params.token;
    // Note: at one point I set the id field from user.username. That ought to be
    // the same as id, since we searched for and if necessary created a user with that
    // username. In fact, however, it was always undefined.
    const authData = { bloom: { id: id, token: token } };
    // console.log("bloomLink authdata from params: " + JSON.stringify(authData));

    // console.log(
    //     "bloomLink authdata from user: " + JSON.stringify(user.authData)
    // );

    if (!user.get("authData")) {
        // console.log(
        //     "bloomLink setting user authdata to " + JSON.stringify(authData)
        // );
        user.set("authData", authData, { useMasterKey: true });
        await user.save(null, { useMasterKey: true });

        // console.log("bloomLink saved user: " + JSON.stringify(user));
        return "linked parse-server user by adding authData";
    } else {
        // console.log(
        //     "bloomLink found existing authData: " +
        //         JSON.stringify(user.authData)
        // );
        return "existing authData";
    }
});
