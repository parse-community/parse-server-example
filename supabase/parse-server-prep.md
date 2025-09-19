# Parse Server Preparation

To prepare for the data synchronization to Supabase, we need to make a change to our Parse Server to track book deletions.

## Tombstone Mechanism for Books

We will add a lightweight Parse class to record deletions. This is often called a "tombstone" pattern.

**New Parse Class: `bookDeletion`**

- `bookId` (String) — the deleted book's objectId.
- `deletedAt` (Date) — when the deletion occurred.
- (Optional) `reason` (String), `userId` (Pointer<`_User`>) for future auditing.

This table is populated by a Parse Cloud `afterDelete` trigger on the `books` class.

## Parse Cloud Code Addition (afterDelete Trigger)

The following code should be added to your Parse Cloud code (`main.js`). It will automatically create a `bookDeletion` record whenever a book is deleted.

```javascript
Parse.Cloud.afterDelete("books", async (request) => {
  try {
    const BookDeletion = Parse.Object.extend("bookDeletion");
    const q = new Parse.Query("bookDeletion");
    q.equalTo("bookId", request.object.id);
    const existing = await q.first({ useMasterKey: true });
    if (existing) return; // idempotent
    const tomb = new BookDeletion();
    tomb.set("bookId", request.object.id);
    tomb.set("deletedAt", new Date());
    await tomb.save(null, { useMasterKey: true });
  } catch (err) {
    request.log.error("afterDelete books tombstone failure: " + err);
  }
});
```
