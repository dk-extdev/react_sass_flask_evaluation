/**
 * Created by rayde on 12/10/2017.
 */
$('form').on('submit', function (e){
  e.preventDefault();
  let email = $('#email').val();
  $('.loading-container').removeClass('hidden');
  fetch('/requestForgotPassword', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({email: email})
  }).then(function(response) {return response.json()})
  .then(function(response) {
    $('.loading-container').addClass('hidden');
    if(response.error){
      Materialize.toast('Error Occurred: ' + JSON.stringify(response.message == null ? response : response.message), 8000, 'red');
    }
    else {
      Materialize.toast('An email as been sent with a link to reset your password. You may have to check your Spam folder', 8000);
    }
  })
})

$(document).ready(function(){
  const data = $('#data');
  const expired = data.data('expired');
  if(expired){
    Materialize.toast('The Password Link has expired. Please request a new one.', 8000, 'red');
  }
})
