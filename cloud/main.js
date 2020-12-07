// const logger = require('parse-server').logger; 

const config = {
  username: process.env['portalUser'],
  password: process.env['portalPass'],
  url: process.env['portalUrl'],
  appName: process.env['appName'],
  client: process.env['clientId'],
  clientDomain: process.env['clientDomain']
};

console.log("CLOUD CODE " + config.appName + " Load...");

Parse.Cloud.define("getToken", async (req) => {
  try
  {
    let expiration = "1440";
    let response = await Parse.Cloud.httpRequest({
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      url: config.url,
      body: {
        username: config.username,
        password: config.password,
        client: "referer",
        ip: "",
        referer: req.params.referer,
        expiration: expiration,
        f: "json"
      }
    });
    return response.text;
  }
  catch (ex)
  {
    console.log(ex, ex.stack);
    throw ("exception saving" + ex);
    return false;
  }
});

Parse.Cloud.define("gltfUsageById", async (req) => {
  var Design = Parse.Object.extend("Design");
  const query = new Parse.Query(Design);
  const designs = await query.find({ useMasterKey: true });
  var usedInDesigns = [];
  for (var i = 0; i < designs.length; i++)
  {
    var design = designs[i]

    for (var j = 0; j < design.attributes.sketchItems.length; j++)
    {
      var item = design.attributes.sketchItems[j];
      if (item && item.attributes && item.attributes.gltfId)
      {
        if (item.attributes.gltfId == req.params.id)
        {
          usedInDesigns.push({ id: design.id, title: design.attributes.name, owner: design.attributes.userId });
          break;
        }
      }
    }
  }
  return (usedInDesigns);
});

Parse.Cloud.define("designUsageById", async (req) => {
  var Project = Parse.Object.extend("Project");
  var ProjectOption = Parse.Object.extend("ProjectOption");
  var projectQuery = new Parse.Query(Project);
  var projects = await projectQuery.find({ useMasterKey: true });
  var idList = {};
  for(var j = 0; j < projects.length; j++)
  {
    var currentProject = projects[j];
    var optionIds = currentProject.attributes.optionIds;
    for(var k = 0; k < optionIds.length; k++)
    {
      var currentId = optionIds[k];
      idList[currentId] = currentId;
    }
  }

  var usedInOptions = [];

  for(const property in idList)
  {
    const query = new Parse.Query(ProjectOption);
    const option = await query.get(property, { useMasterKey: true });

    if(option.attributes.designId == req.params.id)
    {
      usedInOptions.push({ id: option.id, title: option.attributes.title, creator: option.attributes.creator });
    }
  }

  return (usedInOptions);
});

Parse.Cloud.afterSave(Parse.User, async (request) => {
  var user = request.object;

  console.log("afterSave", JSON.stringify(user.attributes, null, 2));
  if(user.attributes.authData && user.attributes.authData.anonymous)
  {
    console.log("ANONYMOUS USER");
    return addUserToRole(user, "Guest");
  }
  else if(user.attributes.email && user.attributes.email.includes(config.clientDomain))
  {
     console.log(clientName + " USER");
     return addUserToRole(user, config.client + '-role');
  }
  else
  {
    console.log("OTHER USER");
    return false;
  }
});

function addUserToRole(user, roleName) {
    console.log("ADD USER TO ROLE");
    var query = new Parse.Query(Parse.Role);
    query.contains("name", roleName);
    return query.find({ useMasterKey: true }).then((roles) =>
    {
        if (roles.length > 0)
        {
            var savePromises = [];
            // console.log("Found Roles" + roles);
            for (var i = 0; i < roles.length; i++)
            {
                // console.log("role[" + i + "]" + roles[i]);
                roles[i].getUsers().add(user);
                // console.log("add");
                savePromises.push(roles[i].save(null, { useMasterKey: true }));
            }
            // console.log("added");
            return Promise.all(savePromises);
        }
        else
        {
            // console.log("No Roles Found");
            var roleACL = new Parse.ACL();
            // console.log("1");
            roleACL.setPublicReadAccess(true);
            // console.log("2");
            roleACL.setPublicWriteAccess(false);
            // console.log("3");
            var organisationRole = new Parse.Role(roleName, roleACL);
            // console.log("4");
            organisationRole.getUsers().add(user);
            // console.log("5");
            var savePromise = organisationRole.save(null, { useMasterKey: true });
            // console.log("6");
            return savePromise;
        }
    }).catch( (error) => {
        console.log(error);
        return Promise.reject();
    });
}

console.log("CLOUD CODE " + config.appName + " Loaded");
