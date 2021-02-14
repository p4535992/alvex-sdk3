function main()
{
   // Get the user name of the person to get
   var userName = url.extension;
   
   // Do we want to return containing groups?
   var groups = (args["groups"] == "true");
   
   // Get the person who has that user name
   var person = peopleAlvex.getPerson(userName);
   if (person != null) 
   {
      model.person = person;
      model.capabilities = peopleAlvex.getCapabilities(person);
      model.groups = groups ? peopleAlvex.getContainerGroups(person) : null;
      model.immutability = groups ? peopleAlvex.getImmutableProperties(userName) : null;
   }
   else 
   {
      status.setCode(status.STATUS_NOT_FOUND, "Person " + userName + " does not exist");
   }
}

main();