//Initialization
const express = require('express');
const app = express();
//adding dependecies
const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//

//3rd party code
const schedule = require('node-schedule');

const cookieParser = require('cookie-parser');

const session=require('express-session');

var MySQLStore = require('express-mysql-session')(session);
//utils
const {calculateNear}=require('./utils/js/MapCalc');

//schedule
var rule = new schedule.RecurrenceRule();

rule.minute = new schedule.Range(0, 59, 3);






app.use(express.urlencoded());
//Temp session db


app.use(session({
  secret: 'kr0b0p0l1is',
  resave: false,
  store:sessionStore,
  saveUninitialized: false,
  cookie: {
    path    : '/',
    httpOnly: false,
    maxAge  : 24*60*60*1000
  }
  //cookie: { secure: true }
}));

app.use(cookieParser());
//DB

const {registerDB,loginDB,reputDB,reportLocationDB,verifyDB,firelocationDB,updateReput,getIDFromReport,pingUserLocationDB,insertMessageDB,getMessageDB}=require('./db/db');
 



 

//delete



const port=process.env.PORT||3000;
app.listen(port);


app.post('/register.api',(req,res)=>{
	console.log(req.body);

	registerDB(req,res,(err)=>{

		if(err){
			console.log('Doslo do greske');
		}else{
			console.log('Uspesno Registrovano');
		}

	});
	res.send({ message: 'success' });
});

//Login
app.post('/login.api',(req,res)=>{
loginDB(req,res,(user)=>{
	if(user){
		req.session.userID=user.id;
		req.session.fname=user.fname;
		req.session.lname=user.lname;
		console.log(user);
		res.send(user);
		console.log(req.session.userID+' session id');
	}else{
		console.log('Ne postoji ovaj nalog');
	}
})
});

//Send current location of user


app.post('/sendUserPing.api/:userID/:lat/:lng',(req,res)=>{
	var lat=req.params.lat;
	var lng=req.params.lng;
	var userID=req.params.userID;
	pingUserLocationDB(req,res,userID,lat,lng);
	getMessageDB(userID,(result)=>{
		if(result.length==0){
			res.send({message:'0'});
		}else{
			console.log(result);
			res.send(result[0]);
		}
	})
	



});
//Report fire
app.post('/report.api/:userID/:lat/:lng',(req,res)=>{
	var latitude=req.params.lat;
	var longitude=req.params.lng;
	var userID=req.params.userID;
	console.log(req.body);
	reputDB(req,res,userID,(reput)=>{
		console.log(reput);
		//Calculate radius based on reputation
		var reputlength=0.2*reput;
		var radius=reputlength/2;
		var centerLocation={
			lat:latitude,
			lng:longitude
		};
		reportLocationDB(req,res,userID,latitude,longitude,(devices)=>{

			console.log(devices);
			calculateNear(devices,centerLocation,10,(deviceIDs)=>{
				if(deviceIDs.length==0){
				res.end();
				}else{
					insertMessageDB(deviceIDs,latitude,longitude);
					res.send({message:'success'}); 
				}
				
			});
		});
		
	});

	
});
//Verify fire locations
app.post('/verify.api',(req,res)=>{
	var postID=req.body.postID;
	verifyDB(req,res,postID,(success)=>{
		getIDFromReport(req,res,postID,(userID)=>{
			reputDB(req,res,userID,(reput)=>{
				var newReput=reput+0.1;
				if(newReput>=5){
					newReput=5;
				}
				updateReput(req,res,userID,newReput,(success)=>{
					res.send(success);
				});	
			});

		});
		
		
	});


});
//Get all fire locations in the world
app.get('/firelocation.api',(req,res)=>{
	firelocationDB(req,res,(firedata)=>{
		res.send(firedata);
	});
});
//If report was fake
app.post('/fake.api',(req,res)=>{
	var userFakeID=req.body.userFakeID;
	reputDB(req,res,userFakeID,(reput)=>{
		var newReput=reput-0.1;
		if(newReput<=0){
			newReput=0;
		}
		updateReput(req,res,userFakeID,newReput,(success)=>{
			res.send(success);
		});	
	});
});

app.listen(port,'0.0.0.0',()=>{

	console.log(`Server is up ${port}`);
});