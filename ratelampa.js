// Отправка запроса к API
var request = new XMLHttpRequest();
request.open("GET", "http://cub.bylampa.online/api/reactions/get/" + movie_id, true);
request.timeout = 2000;
request.send();

// Обработка ответа
request.onload = function() {
  if (this.status === 200) {
    var data = JSON.parse(this.responseText).result;
    var positive = 0, negative = 0;
    
    data.forEach(function(reaction) {
      if (reaction.type === "fire" || reaction.type === "nice") {
        positive += parseInt(reaction.counter, 10);
      } else if (reaction.type === "think" || reaction.type === "bore" || reaction.type === "shit") {
        negative += parseInt(reaction.counter, 10);
      }
    });
    
    var rating = (positive + negative > 0) ? (positive / (positive + negative)) * 10 : 0;
    rating = rating.toFixed(1);
    
    // Добавление рейтинга на страницу
    var ratingElement = $('<div class="full-start__rate rate--lampa"></div>').text(rating);
    $('.rate--kp').after(ratingElement);
  }
};