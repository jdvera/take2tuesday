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

var userId = localStorage.getItem("trilogy-id");
if (!userId) {
   userId = (Math.random() + " ").substring(2, 10) + (Math.random() + " ").substring(2, 10);
   localStorage.setItem("trilogy-id", userId);
}

var openTopic = null;
var userVotes = localStorage.getItem("trilogy-votes");
var userVotesArr = [];

if (userVotes) {
   userVotesArr = userVotes.split(",");
}

function displayTopic(topic) {
   switch (topic) {
      case "git": {
         return "Git";
      }
      case "console": {
         return "Console Commands";
      }
      case "html": {
         return "HTML";
      }
      case "css": {
         return "CSS";
      }
      case "bootstrap": {
         return "Bootstrap";
      }
      case "javascript": {
         return "Javascript";
      }
      case "jquery": {
         return "jQuery";
      }
      case "ajax": {
         return "AJAX/API";
      }
      case "node": {
         return "Node";
      }
      case "npm": {
         return "npm";
      }
      case "other": {
         return "Other";
      }
      default: {
         return topic;
      }
   }
};

database.ref().on("value", function(snapshot) {
   var bulkData = snapshot.val();
   $("#votes-body").empty();


   for (var topic in bulkData) {
      var completedVotes = 0;
      var incompleteVotes = 0;
      var listStr = ``;
      for (var suggestionId in bulkData[topic]) {
         var { completed, votes, description } = bulkData[topic][suggestionId];
         var badgeColor = userVotesArr.includes(suggestionId) ? "badge-primary" : "badge-secondary";
         var emoji = "👍";
         var textDec = "none";
         if (completed) {
            badgeColor = "badge-success";
            emoji = "✔️";
            textDec = "line-through";
            completedVotes += votes;
         }
         else {
            incompleteVotes += votes;
         }

         var listItem = `
            <p class="ml-4">
               <span
                  class="badge badge-pill ${badgeColor} mr-2 item-badge ${completed ? "" : "click-badge"}"
                  data-id="${suggestionId}"
                  data-topic="${topic}"
               >
               ${emoji} ${votes}
               </span>
               <span style="text-decoration: ${textDec};">${description}</span>
            </p>
         `;
         listStr = listStr + listItem;
      }

      // <span class="badge badge-pill badge-success topic-badge">${completedVotes}</span>
      var topicBulk = $(`
         <div class="card accordion-card">
            <div class="card-header" id="${topic}-heading">
               <h2 class="mb-0">
                  <button class="btn btn-link topic-click pl-0 text-decoration-none" type="button" data-toggle="collapse" data-topic="${topic}" data-target="#${topic}-collapse">
                     
                     <span class="badge badge-pill badge-primary mr-2 topic-badge">${incompleteVotes}</span>
                     <span class="topic-title">${displayTopic(topic)}</span>
                  </button>
               </h2>
            </div>
         
            <div id="${topic}-collapse" class="collapse ${openTopic === topic ? "show" : ""}" data-parent="#votes-body">
               <div class="card-body pl-0">
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
   localStorage.setItem("trilogy-votes", userVotes);
};

function removeIdFromLocal(id) {
   userVotesArr = userVotesArr.filter(function(elem) {
      return id !== elem;
   });
   userVotes = userVotesArr.join(",");
   localStorage.setItem("trilogy-votes", userVotes);
};


$(".form-check-input").on("click", function() {
   subjectVal = $(this).val();
});

$(document).on("click", ".click-badge", function() {
   var id = $(this).data("id");
   var topic = $(this).data("topic");
   var votes = parseInt($(this).text().trim().slice(-1));

   if (!userVotesArr.includes(id)) {
      addIdToLocal(id);
      votes++;
      database.ref(`${topic}/${id}`).update({ votes });
   }
   else {
      removeIdFromLocal(id);
      votes--;
      database.ref(`${topic}/${id}`).update({ votes });
   }
});

$(document).on("click", ".topic-click", function() {
   var topic = $(this).data("topic");
   if (openTopic === topic) {
      localStorage.setItem("trilogy-topic", "");
      openTopic = "";
   }
   else {
      localStorage.setItem("trilogy-topic", topic);
      openTopic = topic;
   }
});

$(".test-badge").on("click", function() {
   var num = parseInt($(this).text().trim().slice(-1));
   if (num === 2) {
      $(this).text("👍 3").removeClass("badge-secondary").addClass("badge-primary");
   }
   else {
      $(this).text("👍 2").removeClass("badge-primary").addClass("badge-secondary");
   }
});

$("#topic-form").on("submit", function(event) {
   event.preventDefault();
   var inputVal = $("#topic-description").val().trim();
   if (!inputVal) return;
   for (var i = 0; i < filterThese.length; i++) {
      if (inputVal.toLowerCase().includes(filterThese[i])) {
         return;
      }
   }

   var topicObj = {
      description: inputVal,
      votes: 1,
      completed: false
   };

   var newKey = database.ref("/" + subjectVal).push().key;
   addIdToLocal(newKey);
   database.ref(`/${subjectVal}/${newKey}`).update(topicObj);
   $("#topic-description").val("")
});
