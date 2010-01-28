//-------------------------------------------------------
// Debugging tools (remove later)
//-------------------------------------------------------

var debug = true;

function trace(msg)
{
    if (!debug) {
        return;
    }
    
    var callee = arguments.callee;
    
    if (!callee.count) {
        callee.count = 1;
    }
    
    if (msg !== 0 && !msg) {
        msg = 'falsy';
    }
    
    msg = '' + msg; // Convert to string
    var traceLog = document.getElementById('trace-log');
    
    if (callee.count > 20) {
        traceLog.innerHTML = traceLog.innerHTML.replace(/.+/, '');
    }
    
    traceLog.innerHTML += (callee.count % 10) + ". " + msg + "<br>\n";
    callee.count++;
}

function traceVar(name, value)
{
    if (!debug) {
        return;
    }

    var callee = arguments.callee;

    if (!callee.list) {
        traceVar.list = {};
    }
    
    var elmt = document.getElementById('trace-vars');
    callee.list[name] = value;
    
    elmt.innerHTML = '';
    
    for (var i in callee.list) {
        elmt.innerHTML += i + ": " + callee.list[i] + "<br>";
    }
}
