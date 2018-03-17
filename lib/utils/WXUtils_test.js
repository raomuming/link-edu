
let WXUtils = require('./WXUtils.js');

// WXUtils.jscode2session("021fq9bt1mcvmc0ieaat1krtbt1fq9bs", (error, result) => {
// 	console.log(result);
// });


var code = "011NJ6WQ1xLAca1vJaTQ1tffWQ1NJ6W4";
var iv = "Bbhc3rQfJBt1XQdArUuA8g==";
var cryptedData = "I5zfd/QJtxI9dtRBSHKK9fJRavtusSSZX7X7HYpIibBcEwyqznrX5HCArTG9e1pVQg0mkHKLe43gf3yg60lbMLH4TyYNtyiecmdFdMLdV1NLbHF7Lq6qn216cGV+kfaru6sjMhed46yUNhzZKaYdm3/s5U630ZyNRzWSqsURO9PORZRBCogaMWh1bTFja2D0rfaaLHdGUEUL86UXz3PCWl+hWnehELJ2mFDG3Y4WGRNmGsfrh+Mx2xOwTRNvfzFEi9nI+ztYwQWaJrD6O1p6t0B+20YfYAMD+HIEbNCWyyMLgGXJ1bykRW45JhYujaWmiA5dGjxT98lBQaFF4T4ZgULaysIeXNPtHgUa98XAjOCc1PyXiF1qWx0yXwzifYRaNQBvBUqGUadB/8gkHXhmEpA3YXE/1K86Py0veke3S9vhVes1kgxHfRZVyrXJarAU9d0kxqFp3FEHEppIJYIVbDxRqzkNKUSmO9AlYnsgASI=";
WXUtils.decryptWxUserData(code, cryptedData, iv, (error, decryptedData) => {
	if (error){
		console.log(JSON.stringify(error));
	}
	else {
		console.log('decryptedData => ', JSON.stringify(decryptedData));
	}
});