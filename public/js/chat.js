let socket = io();

let scrollToBottom = () => {
  //selectors
  let messages = jQuery('#messages');
  let newMessage = messages.children('li:last-child');
  //heights
  let clientHeight = messages.prop('clientHeight');
  let scrollTop = messages.prop('scrollTop');
  let scrollHeight = messages.prop('scrollHeight');
  let newMessageHeight = newMessage.innerHeight();
  let lastMessageHeight = newMessage.prev().innerHeight();

  if(clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight){
    messages.scrollTop(scrollHeight);
  };
};

socket.on('connect', () => {
  let params = jQuery.deparam(window.location.search);

  socket.emit('join', params, (err) => {
    if (err) {
      alert(err);
      window.location.href = '/';
    } else {
        console.log('no error');
    };
  });
});

socket.on('disconnect', () => {
  console.log('disconnected from server');
});

socket.on('updateUserList', (users) => {
  let ol = jQuery('<ol></ol>');

  users.forEach((user) => {
    ol.append(jQuery('<li></li>').text(user));
  });
  jQuery('#users').html(ol);
});

socket.on('newMessage', (message) => {
  let formattedTime = moment(message.createdAt).format('h:mm a');
  let template = jQuery('#message-template').html();
  let html = Mustache.render(template, {
    text:message.text,
    from: message.from,
    createdAt: formattedTime
  });
  jQuery('#messages').append(html);
  scrollToBottom();
});

socket.on('newLocationMessage', (message) => {
  let formattedTime = moment(message.createdAt).format('h:mm a');
  let template = jQuery('#location-message-template').html();
  let html = Mustache.render(template, {
    from: message.from,
    url: message.url,
    createdAt: formattedTime
  });
  jQuery('#messages').append(html);
  scrollToBottom();
});

let messageTextBox = jQuery('[name=message]');

jQuery('#message-form').on('submit', (e) => {
  e.preventDefault();

  socket.emit('createMessage', {
    from: 'User',
    text: messageTextBox.val()
  }, () => {
    messageTextBox.val('')
  });
});

let locationButton = jQuery('#send-location');
locationButton.on('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation not supported by your browser.');
  }

  locationButton.attr('disabled', 'disabled').text('Sending Location...');

  navigator.geolocation.getCurrentPosition((position) => {
    locationButton.removeAttr('disabled').text('Send Location');
    socket.emit('createLocationMessage', {
      latitude:position.coords.latitude,
      longitude: position.coords.longitude
    });
  }, () => {
    alert('Unable to fetch location');
    locationButton.removeAttr('disabled').text('Send Location');
  });
});
