const mysql=require('mysql');
const db=mysql.createConnection({
	host:'localhost',
	user:'root',
	password:'',
	database:'earthfire'
	
});
db.connect((err)=>{
	if(err){
		console.log('Error',err);
	}
	console.log('Connected');
});
var loginDB=(req,res,callback)=>{
	var crypto = require('crypto');
	var email=req.body.email;
	var data = req.body.password;
	var newPass=crypto.createHash('md5').update(data).digest("hex");
	var findSqlEmail='SELECT * FROM users WHERE email = ? and password= ?';
	var findQuery=db.query(findSqlEmail,[email,newPass],(err,result)=>{
		if(err) throw err;
		if(result.length>0){
			console.log('Postoji');

			callback(result[0]);
					
		}
		callback(null);


	});
}


var registerDB=(req,res,callback)=>{
	console.log(req.body);
	// var email=req.body.email;
	// var username=req.body.username;
	var unexpected=false;
	var errArray=[];
	var errStr='<br>';
	// var data = req.body.password;
	// tmp
	var email=req.body.email;
	// var username='test';
	var data = req.body.password;
	var phonenu=req.body.phonenu;
	
	var findSqlEmail='SELECT email FROM users WHERE email = ?';
		var findQuery=db.query(findSqlEmail,email,(err,result)=>{
			if(err) throw err;
				if(result.length>0){
					
					if(result[0].email==email){
						errArray.push('Postoji Email');
						// errStr+='Postoji Email <br>';
						unexpected=true;
					}
					
				}
				if(data.length<6){
						errArray.push('Password mora da bude veci od 6 karaktera');
						// errStr+='Password mora da bude veci od 6 karaktera <br>';
						unexpected=true;
				}
				if(unexpected==true){
					callback(errArray);
				}else{


					
					var crypto = require('crypto');
					//console.log();
					var newPass=crypto.createHash('md5').update(data).digest("hex");


					var post={
						fname:req.body.fname,
						lname:req.body.lname,
						email:email,
						password:newPass,
						phonenu:phonenu,
						rating:5
						// adresa:req.body.adresa,
						// zip:req.body.zip,
						// br_proizvoda:0,
						// rating:0
					}
					var sql='INSERT INTO users SET ?';
					var query=db.query(sql,post,(err,result)=>{
						if(err) throw err;
						console.log(result);
						//res.send('Created');
						callback(null);
					});

				}
			

		});


	//console.log(JSON.stringify(req.body.ime));
	
	

}
//Reputation of user
var reputDB=(req,res,userID,callback)=>{
	// var userID=req.body.userID;

	var getReputatuion='SELECT rating FROM users WHERE id=?';
	var getReputatuionQuery=db.query(getReputatuion,userID,(err,result)=>{
		console.log(result[0].rating);
		callback(result[0].rating);
	});

}
//Report fire location
var reportLocationDB=(req,res,userID,lat,lng,callback)=>{
	var data={
		userID:userID,
		latitude:lat,
		longitude:lng,
		verified:0
	}
	var insertReport='INSERT INTO firelocation SET ?';
	var selectDevices='SELECT * FROM userslocation';
	var query=db.query(insertReport,data,(errPost,resultPost)=>{
			if(errPost) throw errPost;
			console.log(resultPost);
			var newQuery=db.query(selectDevices,(errDevice,resultDevice)=>{
				if(errDevice){
					console.log(errDevice);
					callback(null);
				}
				else
					callback(resultDevice);
			});			//res.send('Created');
						
			
	});

};
//Insert current location of fire to the database of nearby people
var insertMessageDB=(userID,lat,lng)=>{
	console.log(userID);
	var dataArray=[];
	for(var i =0;i<userID.length;i++){
		var data=[
			userID[i],
			lat,
			lng,
			0
		];
		dataArray.push(data);
	}
	console.log(dataArray);
	
	var insertMessage='INSERT INTO usermessage (userID,lat,lng,rmessage) VALUES ?';
	var query=db.query(insertMessage,[dataArray],(errInsert,result)=>{
		if(errInsert) throw errInsert;

		console.log('Uspesno');
	})
}
//Nearby people get locations of fire
var getMessageDB=(userID,callback)=>{
	var getData='SELECT lat,lng FROM usermessage WHERE userID=? AND rmessage=0';
	var query=db.query(getData,userID,(err,result)=>{
		if(err) throw err;



		callback(result);
	})
}
//Verify fire
var verifyDB=(req,res,postID,callback)=>{
	var updateVerify='UPDATE firelocation SET verified=1 WHERE id=?';
	var updateVerifyQuery=db.query(updateVerify,postID,(err,result)=>{
		if (err) throw err;
		callback('1');
	});
}
//All fire locations(Shown on website map)
var firelocationDB=(req,res,callback)=>{
	var selectLocations='SELECT * FROM firelocation WHERE verified=1';
	var selectLocationsQuery=db.query(selectLocations,(err,result)=>{
		if (err) throw err;
		callback(result);
	});
}
//Update users reputation
var updateReput=(req,res,userID,reput,callback)=>{
	var updateReput='UPDATE users SET rating=? WHERE id=?';
	var updateReputDB=db.query(updateReput,[reput,userID],(err,result)=>{
		if(err) throw err;
		callback('1');
	});
	

}
//Get if from person who reported the fire
var getIDFromReport=(req,res,postID,callback)=>{
	var selectLocations='SELECT userID FROM firelocation WHERE id=?';
	var selectLocationsQuery=db.query(selectLocations,postID,(err,result)=>{
		if (err) throw err;
		callback(result[0].userID);
	});
}





var pingUserLocationDB=(req,res,userID,lat,lng)=>{
	
	var getLocation='SELECT * FROM userslocation WHERE userID=?';
	var findQuery=db.query(getLocation,userID,(err,result)=>{
		if(err) console.log(err);
				if(result.length>0){
					var updateLocation='UPDATE userslocation SET lat=?,lng=? WHERE userID=?';
					var updateQuery=db.query(updateLocation,[lat,lng,userID],(errUpdate,resultUpdate)=>{

					});
				}else{
					var post={
						userID:userID,
						lat:lat,
						lng:lng
					};
					var instertLocation='INSERT INTO userslocation SET ?';
					var insertQuery=db.query(instertLocation,post,(errInsert,resultInsert)=>{

					});
				}
	});
			

}
module.exports={
	registerDB,
	loginDB,
	reputDB,
	reportLocationDB,
	verifyDB,
	firelocationDB,
	updateReput,
	getIDFromReport,
	pingUserLocationDB,
	insertMessageDB,
	getMessageDB
};