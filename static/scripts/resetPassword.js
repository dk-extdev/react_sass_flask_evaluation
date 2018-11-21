/**
 * Created by rayde on 12/10/2017.
 */
$('form').on('submit', function(e){
  e.preventDefault();
  const token = $('#data').data('token');
  const password = $('#password').val();
  const confirmPassword = $('#confirm-password').val();
  if(password !== confirmPassword){
    Materialize.toast('The passwords do not match.', 8000, 'red');
    return;
  }

  $('.loading-container').removeClass('hidden');
  fetch('/forgotPassword', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({token: token,  password: password})
  }).then(function(response) { return response.json()})
  .then(function(response) {
    window.location.replace(response.redirect);
  }, function(error) {
    window.location.replace(error.redirect);
  })
})
