var calculateNear=(devicePoint,centerPoint,km,callback)=>{
	var ky = 40000 / 360;
	var deviceID=[];
	for(var i=0;i<devicePoint.length;i++){
		var kx = Math.cos(Math.PI * centerPoint.lat / 180.0) * ky;
	    var dx = Math.abs(centerPoint.lng - devicePoint[i].lng) * kx;
	    var dy = Math.abs(centerPoint.lat - devicePoint[i].lat) * ky;

	    if(Math.sqrt(dx * dx + dy * dy) <= km){
	    	deviceID.push(devicePoint[i].userID);
	    }
	}
    
    callback(deviceID);
}
module.exports={
  calculateNear
}