var app_id = "org.projectfurnace.buddjet";

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





function appStart() 
{
  if (typeof(Storage) !== "undefined") 
  {


      var session = localStorage.getItem(app_id + ".logged-in-session");

      // if we already have a valid session
      // then redirect to app page
      if (session !== null && typeof(session) !== "undefined")
      {
        window.location.href = "app.html";
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


function hashToString(dataStr)
{
  var result;
  var t = sjcl.hash.sha256.hash(dataStr);
  for (var i = 0; i < t.length; i++)
  {
    result += t[i].toString();
  }
  return result;
}

function login() 
{
  var email = $('input#login-email').val();
  var passwd = $('input#login-passwd').val();
  var session = hashToString(email);

  var credentials = localStorage.getItem(app_id + "." + session + '.credentials');

  if (credentials !== null && typeof(credentials) !== "undefined" && sjcl.decrypt(passwd, credentials) == email)
  {
    localStorage.setItem(app_id + ".logged-in-session", session);
  }
  else
  {
    alert('login/passwd error');
  }
}



function signup()
{
  // TODO verify if such an email is already stored
  var email = $('input#email').val();
  var passwd = $('input#passwd').val();
  var encryptetEmail = sjcl.encrypt(passwd, email);
  var session = hashToString(email);


  var entered_identity = sjcl.encrypt(app_id, $('input#firstname').val() + ' ' + $('input#lastname').val());

  localStorage.setItem(app_id + ".logged-in-session", session);
  localStorage.setItem(app_id + "." + session + ".credentials", encryptetEmail);
  localStorage.setItem(app_id + "." + session + ".data", '');
  localStorage.setItem(app_id + "." + session + '.fullid', entered_identity);

}