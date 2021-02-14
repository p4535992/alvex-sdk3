function main()
{
   // Extract the person's user name from the URL
   var userName = url.extension;
   
   // Get the person we wish to delete
   var person = peopleAlvex.getPerson(userName);

   // if person is found matching the given user name
   // then delete that person
   if (person != null)
   {
      // delete the person
      peopleAlvex.deletePerson(userName);
   }
   // else if no person was found matching the given user name,
   // then return HTTP error status "not found"
   else
   {
      status.setCode(status.STATUS_NOT_FOUND, "Person " + userName
            + " does not exist and thus can't be deleted");
      return;
   }
}

main();