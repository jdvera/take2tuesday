var firebaseConfig = {
   apiKey: "AIzaSyAGxUgOUK8okF7wl197ZfWJadz_UF9TYuE",
   authDomain: "take2tuesday.firebaseapp.com",
   databaseURL: "https://take2tuesday.firebaseio.com",
   projectId: "take2tuesday",
   storageBucket: "",
   messagingSenderId: "896372061968",
   appId: "1:896372061968:web:4157a26038bca110"
};

firebase.initializeApp(firebaseConfig);
var database = firebase.database();

var subjectVal = "git";
$(".other-wrapper").hide();

var userId = localStorage.getItem("trilogy-id");
if (!userId) {
   userId = (Math.random() + " ").substring(2, 10) + (Math.random() + " ").substring(2, 10);
   localStorage.setItem("trilogy-id", userId);
}
var openTopic = localStorage.getItem("trilogy-topic");
var userVotes = localStorage.getItem("trilogy-votes");
var userVotesArr = [];

if (userVotes) {
   userVotesArr = userVotes.split(",");
}



database.ref().on("value", function(snapshot) {
   console.log(snapshot.val());
   var bulkData = snapshot.val();
   $("#votes-body").empty();

   for (var topic in bulkData) {
      var topicTotalVotes = 0;
      var listStr = ``;
      for (var suggestionId in bulkData[topic]) {
         if (bulkData[topic][suggestionId].user === userId) {
            userVotesArr.push(suggestionId);
         }
         topicTotalVotes += bulkData[topic][suggestionId].votes;
         var badgeColor = userVotesArr.includes(suggestionId) ? "badge-secondary" : "badge-primary";
         var listItem = `
            <p class="ml-4">
               <span
                  class="badge badge-pill ${badgeColor} mr-2 click-badge"
                  data-id="${suggestionId}"
                  data-topic="${topic}"
               >
                  ${bulkData[topic][suggestionId].votes}
               </span>
               ${bulkData[topic][suggestionId].description}
            </p>`;
         listStr = listStr + listItem;
      }

      var topicBulk = $(`
         <div class="card accordion-card">
            <div class="card-header" id="${topic}-heading">
               <h2 class="mb-0">
                  <button class="btn btn-link topic-click" type="button" data-toggle="collapse" data-topic="${topic}" data-target="#${topic}-collapse">
                     <span class="badge badge-pill badge-primary mr-2">${topicTotalVotes}</span>${topic}
                  </button>
               </h2>
            </div>
         
            <div id="${topic}-collapse" class="collapse ${openTopic === topic ? "show" : ""}" data-parent="#votes-body">
               <div class="card-body">
                  ${listStr}
               </div>
            </div>
         </div>
      `);

      $("#votes-body").append(topicBulk);
   }
});

function addIdToLocal(id) {
   userVotesArr.push(id);
   userVotes = userVotesArr.join(",");
   console.log('userVotes:', userVotes)
   localStorage.setItem("trilogy-votes", userVotes);
}


$(".form-check-input").on("click", function(event) {
   subjectVal = $(this).val();

   if (subjectVal === "other") {
      $(".other-wrapper").show();
   }
   else {
      $(".other-wrapper").hide();
   }
});

$(document).on("click", ".click-badge", function() {
   var id = $(this).data("id");
   var topic = $(this).data("topic");
   var votes = parseInt($(this).text());
   if (!userVotesArr.includes(id)) {
      addIdToLocal(id);
      votes++;
      database.ref(`${topic}/${id}`).update({ votes });
   }
   else {
      console.log("that badge has already been clicked on");
   }
});

$(document).on("click", ".topic-click", function() {
   var topic = $(this).data("topic");
   if (openTopic === topic) {
      localStorage.setItem("trilogy-topic", "");
   }
   else {
      localStorage.setItem("trilogy-topic", topic);
   }
})

$("#topic-form").on("submit", function(event) {
   event.preventDefault();
   var topicObj = {
      description: $("#topic-description").val(),
      votes: 1,
      user: userId
   };

   database.ref("/" + subjectVal).push(topicObj);
})