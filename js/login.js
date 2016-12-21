


$('.form').find('input, textarea').on('keyup blur focus', function (e) {
  
  var $this = $(this),
      label = $this.prev('label');

	  if (e.type === 'keyup') {
			if ($this.val() === '') {
          label.removeClass('active highlight');
        } else {
          label.addClass('active highlight');
        }
    } else if (e.type === 'blur') {
    	if( $this.val() === '' ) {
    		label.removeClass('active highlight'); 
			} else {
		    label.removeClass('highlight');   
			}   
    } else if (e.type === 'focus') {
      
      if( $this.val() === '' ) {
    		label.removeClass('highlight'); 
			} 
      else if( $this.val() !== '' ) {
		    label.addClass('highlight');
			}
    }

});

$('.tab a').on('click', function (e) {
  
  e.preventDefault();
  
  $(this).parent().addClass('active');
  $(this).parent().siblings().removeClass('active');
  
  target = $(this).attr('href');

  $('.tab-content > div').not(target).hide();
  
  $(target).fadeIn(600);
  
});




function hashToString(dataStr)
{
  var result = "";
  var t = sjcl.hash.sha256.hash(dataStr);
  for (var i = 0; i < t.length; i++)
  {
    result += t[i].toString();
  }
  return result;
}





function signup()
{

  var email = $('input#email').val();
  var passwd = $('input#passwd').val();

  // TODO verify if such an email is already stored
  
  var encryptetEmail = sjcl.encrypt(passwd, email);
  var session = hashToString(email);

  var data = encodeData(JSON.parse(new_user_raw_data));


  var entered_identity = sjcl.encrypt(app_id, $('input#firstname').val() + ' ' + $('input#lastname').val());

  localStorage.setItem(app_id + "." + session + ".credentials", encryptetEmail);
  localStorage.setItem(app_id + "." + session + ".data", data);
  localStorage.setItem(app_id + "." + session + '.fullid', entered_identity);
  localStorage.setItem(app_id + "." + session + ".revision", "0");
  localStorage.setItem(app_id + "." + session + ".history-length", "6");
  localStorage.setItem(app_id + "." + session + ".cmd_pipe", encodeData([]));
  localStorage.setItem(app_id + "." + session + ".first-time", "true");
  localStorage.setItem(app_id + ".logged-in-session", session);


  //window.location.href = "index.html";


  saveSessionAsNewUser();
  // just in case registering has failed
  checkSession();

}


function asyncLogin(email, passwd)
{
  var session = hashToString(email);

  var credentials = localStorage.getItem(app_id + "." + session + '.credentials');

  // local verification
  if (credentials !== null && typeof(credentials) !== "undefined" && sjcl.decrypt(passwd, credentials) == email)
  {
    localStorage.setItem(app_id + ".logged-in-session", session);
    checkSession();
  }
  else if (pro_version)
  {
    // online verification
    var jqxhr = $.post(
      "http://sandbox.projectfurnace.org/field_request.php",
      { user : session, field : "*" }
    );

    jqxhr.fail( 
      function() { console.log('failure');  checkSession(); }
    );

    jqxhr.done(
      function(d) 
      {
        if (d != null && typeof(d) != "undefined")
        {
          var record = fieldRequestResponseToObject(d);
          if (record != null && typeof(record) != "undefined" && record.PASSWD != null && typeof(record.PASSWD) != "undefined" && sjcl.decrypt(passwd, record.PASSWD) == email )
          {
            localStorage.setItem(app_id + ".logged-in-session", session);

            var localRevision = localStorage.getItem(app_id + "." + session + ".revision");

            // first login on this device/browser
            if (localRevision == null || typeof(localRevision) == undefined)
            {
              localStorage.setItem(app_id + "." + session + ".revision", record.REV);
              localStorage.setItem(app_id + "." + session + ".cmd_pipe", encodeData([]));
              localStorage.setItem(app_id + "." + session + ".history-length", "6");
            }
            
            localStorage.setItem(app_id + "." + session + ".fullid", record.NAME);
            localStorage.setItem(app_id + "." + session + ".credentials", record.PASSWD);
            localStorage.setItem(app_id + "." + session + ".data", record.JSONDATA);

            checkSession();
          }
          else
          {
            localStorage.removeItem(app_id + ".logged-in-session");
            localStorage.removeItem(app_id + ".u");
            localStorage.removeItem(app_id + ".p");

            checkSession();
          }
        }
        
      }
    );
  }
}


function login() 
{
  var email = $('input#login-email').val();
  var passwd = $('input#login-passwd').val();

  localStorage.setItem(app_id+ ".u", email);
  localStorage.setItem(app_id+ ".p", passwd);


  // ADDED
  checkSession();

}

function gotoAppPage()
{
  var raw_data = encodeData(user_data);
  var session = localStorage.getItem(app_id + ".logged-in-session");
  localStorage.setItem(app_id + "." + session + ".data", raw_data);
  window.location.href = "app.html";
}


function checkSession()
{
  if (typeof(Storage) !== "undefined") 
  {
      $(document.body).css('visibility', 'hidden');

      var session = localStorage.getItem(app_id + ".logged-in-session");

      var u = localStorage.getItem(app_id + '.u');
      var p = localStorage.getItem(app_id + '.p');

      
      //
      if ( u != null && typeof(u) != "undefined" && p != null && typeof(p) != "undefined")
      {
        localStorage.removeItem(app_id + '.u');
        localStorage.removeItem(app_id + '.p');
        $(document.body).css('visibility', 'hidden');
        asyncLogin(u, p);
      }
      // if we already have a valid session
      // then redirect to app page
      else if (session != null)
      {

        var raw_data = localStorage.getItem(app_id + "." + session + ".data");
        if (raw_data == null || typeof(raw_data) == "undefined" || raw_data.length < 100)
        {
          user_data = JSON.parse(new_user_raw_data);
        }
        else
        {
          user_data = decodeData(raw_data);
        }

        var cmd_pipe_raw = localStorage.getItem(app_id + "." + session + ".cmd_pipe");
        change_cmd_pipe = decodeData(cmd_pipe_raw);

        if (change_cmd_pipe == null)
        {
          change_cmd_pipe = [];
        }

        synchronizeWithServer(gotoAppPage, gotoAppPage);

        
      }
      else
      {
        $(document.body).css('visibility', 'visible');
      }

  }
  else 
  {
    // TODO redirect to error page
    // write access to local storage denied to application
    //alert('FATAL ERROR: ACCESS DENIED TO LOCAL STORAGE');
    window.location.href = "error/error.html";
  } 

}


