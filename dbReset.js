/*  ================================================================  */
/*  Helper js to set up local DB                       				  */
/*  ================================================================  */

var mongojs = require('mongojs');

var mongo_url = '127.0.0.1:27017/builder';

var containerData = [{"containerId":3,"item":"Dal","itemWeight":[0,4],"date":[1440525805,1440871405]},{"containerId":4,"item":"Urad Dal","itemWeight":[1],"date":[1440899980]},{"containerId":1,"item":"Salt","itemWeight":[1,2],"date":[1440871406,1440180205]},{"containerId":2,"item":"Sugar","itemWeight":[1,2],"date":[1439661805,1439921005]}];
var nutritionData = [{"item":"Sugar","energy":290,"protein":0,"fat":0,"carbs":100,"sugar":100,"kcal":387},{"item":"Salt","energy":100,"protein":0,"fat":0,"carbs":104,"sugar":1,"kcal":45},{"item":"Dal","energy":100,"protein":22,"fat":1.5,"carbs":63,"sugar":18,"kcal":343},{"item":"Urad Dal","energy":400,"protein":25,"fat":1.6,"carbs":59,"sugar":10,"kcal":341}];
var recipeData = [{"recipeId":100,"recipeName":"Tea","ingredients":["Tea","Milk","Sugar"]},{"recipeId":101,"recipeName":"Rice","ingredients":["Rice","Salt"]},{"recipeId":102,"recipeName":"Payasam","ingredients":["Milk","Wheat","Sugar"]},{"recipeId":104,"recipeName":"Paratha","ingredients":["Potato","Salt","Maida","Oil","Onion"]},{"recipeId":105,"recipeName":"Sweet Corn","ingredients":["Corn","Salt","Butter"]}];

// Getting a db object with the 3 required collections
var db = mongojs(mongo_url, ['container', 'nutrition', 'recipe']);

// Duplicate code for all collections.
// TODO Make it more modular

db.container.drop( function (err, docs) {
	db.container.insert(containerData, function (err, docs) {
		if(err) {
			console.log("Error in inserting DB: " + err);
			process.exit(1);
		}
		else {
			console.log("Container created successfully");
		}
	});
}); 

db.nutrition.drop( function (err, docs) {
	db.nutrition.insert(nutritionData, function (err, docs) {
		if(err) {
			console.log("Error in inserting DB: " + err);
			process.exit(1);
		}
		else {
			console.log("Nutrition created successfully");
		}
	});
}); 

db.recipe.drop( function (err, docs) {
	db.recipe.insert(recipeData, function (err, docs) {
		if(err) {
			console.log("Error in inserting DB: " + err);
			process.exit(1);
		}
		else {
			console.log("Recipe created successfully");
			db.close();
		}
	});
}); 