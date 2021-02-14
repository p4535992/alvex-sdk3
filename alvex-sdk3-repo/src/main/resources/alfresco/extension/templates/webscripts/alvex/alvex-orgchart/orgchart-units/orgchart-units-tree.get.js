var sortByWeight = function(a, b)
{
	var weightA = parseFloat( a.weight );
	var weightB = parseFloat( b.weight );
	if( weightA != weightB )
		return weightA - weightB;
	else
		return a.displayName.localeCompare(b.displayName);
};

function buildTree(unit, inheritedAdmin) {
	var isAdmin = inheritedAdmin;
	logger.error("unit: " + jsonUtils.toJSONString(unit));
	logger.error("isAdmin: " + jsonUtils.toJSONString(isAdmin));
	for each (admin in unit.admins){
		if(admin.getUserName() == person.properties.userName){
			isAdmin = true;
		}
	}
	logger.error("unit.name: " + unit.name);
	logger.error("unit.displayName: " + unit.displayName);
	logger.error("unit.weight: " + unit.weight);
	logger.error("unit.groupRef: " + unit.groupRef);
	logger.error("unit.id: " + unit.id);
	logger.error("isAdmin.toString(): " + isAdmin.toString());
	var el = {
		name: unit.name,
		displayName: unit.displayName,
		weight: unit.weight,
		groupRef: unit.groupRef,
		id: unit.id,
		isAdmin: isAdmin.toString(),
		children: []
	};
	logger.error("2" );
	var cunits = unit.children.sort( sortByWeight );
	logger.error("cunits: " + jsonUtils.toJSONString(cunits));
	for each (var child in cunits){
		el.children.push(buildTree(child, isAdmin));
	}
	logger.error("el: " + jsonUtils.toJSONString(el));
	return el;
}

(function(){
	try{
		var branchName = url.templateArgs['branch'];
		logger.error("branchName: " + branchName);
		var unit = orgchart.getBranch(branchName);
		logger.error("orgchart.getBranch(branchName): " + jsonUtils.toJSONString(unit));
		model.tree = buildTree(orgchart.getBranch(branchName), person.properties.userName == "admin");
		logger.error("status.code");
		status.code = 200;
	}
	catch (e) {
		status.code = 500;
		status.message = e.message;
		model.message = e.message;
	}
})();
