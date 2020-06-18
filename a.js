var mysql=require("mysql");
var express=require("express");
var bodyParser = require('body-parser');
var http=require('http')
var multer=require("multer");
var exp=express();
bodyParser = require('body-parser');
var session=require("express-session");
var passport=require("passport");
var LocalStrategy=require("passport-local");
var path=require("path");
var log;
var roll_no;
var logged;

exp.use(bodyParser.json());
exp.use(bodyParser.urlencoded({extended : true}));
exp.use(express.static('public'));
exp.use(session({
	secret:'secret',
	resave: true,
	saveUninitialized: true

}))
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Arizona",
  
});
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public')
  },
  filename: function (req, file, cb) {
     cb(null, file.originalname)
  }
})

var upload = multer({ storage: storage })
con.connect(function(err) {
  if (err) {
  	console.log(err);
  }
  console.log("Connected!");
});
con.query("CREATE DATABASE IF NOT EXISTS mywebweb");
con.query("USE myweb");
con.query("CREATE TABLE IF NOT EXISTS myweb(Roll_no int primary key not null,Name varchar(20) not null, Department varchar(15) not null,Sex varchar(1) not null,Year int not null,Password varchar(20) not null,Private int default 0)",function(err){if(err) throw err;});
con.query("CREATE TABLE IF NOT EXISTS invite(Roll_no int primary key not null,carbaret int not null default 0,disco int not null default 0)",function(err){if(err) throw err;});
con.query("CREATE TABLE IF NOT EXISTS box(Name varchar(10) not null,Image varchar(10) not null,Description varchar(40) not null)",function(err){if(err) throw err;});
con.query("CREATE TABLE IF NOT EXISTs register(Name varchar(10) not null,Roll_no int not null default 0)",function(err){if(err) throw err;})

exp.get('/', function(req, res) {
	req.session = null;
    res.sendFile(path.join(__dirname + '/login.html'));

});



exp.post('/auth', function(request, response) {
	roll_no = request.body.roll_no;
	console.log('logged');
	var password = request.body.password;
	
	if (roll_no && password) {
		con.query('SELECT * FROM myweb WHERE Roll_no = ? AND Password = ?', [roll_no, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.username=results[0].Name;
				request.session.sex=results[0].Sex;
				request.session.priv=results[0].Private;
				request.session.loggedin=true;

				
				
				//response.render("app.ejs", log);
				response.redirect("/home");


			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});
exp.get("/logout",function(request,response){
	request.session.loggedin=false; 
	response.redirect('/');
	request.session = null;


})
exp.get('/home',function(request,response){
	if(request.session.loggedin){
	log={
					name: request.session.username,
					sex: request.session.sex+".jpg",
					priv: request.session.priv
				};
	response.render("app.ejs",log);
	response.end();
}
else response.redirect("/");
})

exp.post('/sign',function(req,res){
	if(req.body.ref==100){
		var priv=1;
	}
	var name=req.body.name;
	var roll_no=req.body.roll_no;
	var year=req.body.year;
	var department=req.body.department;
	var gender=req.body.sex;

	var password=req.body.password;
	console.log("updatedsmmmm");
	if(gender=='male'||gender=='female'||gender=='Female'||gender=='Male'){
		if(gender=='male'||gender=="Male")
			gender="M";
		else
			gender="F";
		console.log(roll_no);
		con.query("INSERT INTO myweb(Name,Roll_no,Sex,Year,Department,Password,Private) VALUES (?,?,?,?,?,?,?)",[name,roll_no,gender,year,department,password,priv],function(error,results,field){
		if(error)
			console.log("error"+error.message);
		
		res.redirect("/");
		res.end();
		
	});
		
		
	}
	else{
		res.send('please enter proper gender');
		res.end();
	}
})
exp.get("/auth/create",function(req,res){
	res.render("create.ejs")
})
exp.post('/auth/create/inv',upload.single("pic"),function(req,res){
	
	var image=req.file.originalname;
	var name=req.body.name;
	var description=req.body.description;
	const file =req.file;
	console.log(file);
	
	con.query("INSERT INTO box(Name,Image,Description) VALUES (?,?,?)",[name,image,description],function(errr,result,field){
		console.log(log);
		res.redirect("/home");
		res.end();
	})

})
exp.get('/auth/invitations',function(req,response){
	var n=[];
	con.query("SELECT * FROM box",function(err,res,fields){
		if(err) throw err;
			for(i=0;i<res.length;i++){
			n.push({name: res[i].Name, image:res[i].Image, description:res[i].Description});
		}
			response.render("invitation.ejs",{n:n});
			response.end();
		
		

	})
	
		
})
exp.post('/auth/invitations/reg',function(req,res){
	var name=req.body.name;
	console.log(req.body.name);

	con.query("INSERT INTO register(Name,roll_no) VALUES (?,?)",[name,roll_no],function(err,results,fields){
		if(err) throw err;
		res.redirect("/home");

	})
})
exp.get("/auth/reg",function(req,res){
	con.query("SELECT distinct * FROM register WHERE Roll_no=?", roll_no,function(err,results,field){
		var l=[];
		if(results.length){
		for(var i=0;i<results.length;i++){
			l.push({name: results[i].Name})
		}
		console.log(l);
		res.render("register.ejs",{l:l});
	} else res.render("dummy.ejs");
	})
})
exp.get("/auth/priv",function(req,res){
	res.render("priv.ejs");
	res.end();
})




/*con.end(function(err) {
  if (err) {
    return console.log('error:' + err.message);
  }
  console.log('Close the database connection');
});*/

exp.listen(3000);










