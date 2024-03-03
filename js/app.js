$(document).ready(function () {
  const welcomeText = `This is an offline-capable Notepad which is a Progressive Web App.

	The app serves the following features:

	- Write notes which are then saved to the localStorage.
	- Installable on supported browsers for offline usage.
	- "Add To Home Screen" feature on Android-supported devices to launch the app from the home screen.
	- Dark mode.
	- Privacy-focused - We'll never collect your precious data.
	- Light-weight - Loads almost instantly.
	- It's open-source!

	CAUTION: Since the app uses the browser's localStorage to store your notes, 
	it's recommended that you take backup of your notes more often using the 
	"Download Notes" button or by pressing "Ctrl/Cmd + S" keys.

	** Start writing your notes **`;

  const darkModeText = "Enable dark mode";
  const lightModeText = "Enable light mode";
  let uygModeText = "Enable Uyghurche";
  let englishModeText = "Enable English";

  const darkMetaColor = "#0d1117";
  const lightMetaColor = "#795548";
  const metaThemeColor = document.querySelector("meta[name=theme-color]");

  if (localStorage.getItem("note") && localStorage.getItem("note") != "") {
    const noteItem = localStorage.getItem("note");
    $("#note").val(noteItem);
  } else {
    $("#note").val(welcomeText);
  }

  if (!localStorage.getItem("isUserPreferredTheme")) {
    localStorage.setItem("isUserPreferredTheme", "false");
  }

  if (localStorage.getItem("mode") && localStorage.getItem("mode") !== "") {
    if (localStorage.getItem("mode") === "dark") {
      enableDarkMode(lightModeText, darkMetaColor, metaThemeColor);
    } else {
      enableLightMode(darkModeText, lightMetaColor, metaThemeColor);
    }
  }

  if (localStorage.getItem("lang") && localStorage.getItem("lang") !== "") {
    if (localStorage.getItem("lang") === "uygch") {
      enableUyg(englishModeText);
    } else {
      enableEnglish(uygModeText);
    }
  }else{
    enableEnglish(uygModeText);
  }

  $("#note").keyup(
    debounce(function () {
      localStorage.setItem("note", $(this).val());
    }, 500)
  );

  $("#clearNotes").on("click", function () {
    Swal.fire({
      title: "Want to delete notes?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete",
    }).then((result) => {
      if (result.value) {
        $("#note").val("").focus();
        $("#converted_result").val("").focus();
        localStorage.setItem("note", "");
        localStorage.setItem("converted_result", "");

        Swal.fire("Deleted!", "Your notes has been deleted.", "success");
      }
    });
  });

  $("#mode").click(function () {
    $(document.body).toggleClass("dark");
    let bodyClass = $(document.body).attr("class");

    if (bodyClass === "dark") {
      enableDarkMode(lightModeText, darkMetaColor, metaThemeColor);
    } else {
      enableLightMode(darkModeText, lightMetaColor, metaThemeColor);
    }

    localStorage.setItem("isUserPreferredTheme", "true");
  });

  $("#lang").click(function () {
    var targetNode = document.getElementById("note");
    changeDirection(targetNode, !isGlobalUyghur); ///this function and the last param is from uygch.js
    isGlobalUyghur
      ? enableUyg(englishModeText)
      : enableEnglish(uygModeText);
    isGlobalUyghur = !isGlobalUyghur;
  });

  $("#copyToClipboard").click(function () {
    let note_val = $("#note").val();
    navigator.clipboard.writeText(note_val).then(
      function () {
        if (note_val != "") showToast("Notes copied to clipboard!");
        else showToast("Empty! No text to copy.");
      },
      function () {
        showToast("Copied fail! Check permissions for clipboard.");
      }
    );
  });

  $("#copyResultToClipboard").click(function () {
    let result_val = $("#converted_result").val();
    navigator.clipboard.writeText(result_val).then(
      function () {
        if (result_val != "") showToast("Result copied to clipboard!");
        else showToast("Empty! No text to copy.");
      },
      function () {
        showToast("Copied fail! Check permissions for clipboard.");
      }
    );
  });

  $("#downloadNotes").click(function () {
    saveTextAsFile(note.value, getFileName());
  });

  // This changes the application's theme when
  // user toggles device's theme preference
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", ({ matches }) => {
      // To override device's theme preference
      // if user sets theme manually in the app
      if (localStorage.getItem("isUserPreferredTheme") === "true") {
        return;
      }

      if (matches) {
        enableDarkMode(lightModeText, darkMetaColor, metaThemeColor);
      } else {
        enableLightMode(darkModeText, lightMetaColor, metaThemeColor);
      }
    });

  // This sets the application's theme based on
  // the device's theme preference when it loads
  if (localStorage.getItem("isUserPreferredTheme") === "false") {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      enableDarkMode(lightModeText, darkMetaColor, metaThemeColor);
    } else {
      enableLightMode(darkModeText, lightMetaColor, metaThemeColor);
    }
  }

  if (getPWADisplayMode() === "standalone") {
    $("#installApp").hide();
  }

  window
    .matchMedia("(display-mode: standalone)")
    .addEventListener("change", ({ matches }) => {
      if (matches) {
        $("#installApp").hide();
      } else {
        $("#installApp").show();
      }
    });

  document.onkeydown = function (event) {
    event = event || window.event;

    if (event.key === "Escape") {
      $("#aboutModal").modal("hide");
    } else if (event.ctrlKey && event.code === "KeyS") {
      saveTextAsFile(note.value, getFileName());
      event.preventDefault();
    }
  };
});

// Registering ServiceWorker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("sw.js")
    .then(function (registration) {
      console.log(
        "ServiceWorker registration successful with scope: ",
        registration.scope
      );
    })
    .catch(function (err) {
      console.log("ServiceWorker registration failed: ", err);
    });
}

let deferredPrompt;
let installSource;

window.addEventListener("beforeinstallprompt", (e) => {
  $(".install-app-btn-container").show();
  deferredPrompt = e;
  installSource = "nativeInstallCard";

  e.userChoice.then(function (choiceResult) {
    if (choiceResult.outcome === "accepted") {
      deferredPrompt = null;
    }

    ga("send", {
      hitType: "event",
      eventCategory: "pwa-install",
      eventAction: "native-installation-card-prompted",
      eventLabel: installSource,
      eventValue: choiceResult.outcome === "accepted" ? 1 : 0,
    });
  });
});

const installApp = document.getElementById("installApp");

installApp.addEventListener("click", async () => {
  installSource = "customInstallationButton";

  if (deferredPrompt !== null) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      deferredPrompt = null;
    }

    ga("send", {
      hitType: "event",
      eventCategory: "pwa-install",
      eventAction: "custom-installation-button-clicked",
      eventLabel: installSource,
      eventValue: outcome === "accepted" ? 1 : 0,
    });
  } else {
    showToast("Notepad is already installed.");
  }
});

window.addEventListener("appinstalled", () => {
  deferredPrompt = null;

  const source = installSource || "browser";

  ga("send", "event", "pwa-install", "installed", source);
});

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

function ConvertL2U() {
  var alphabet = new Array();

  var letter = new Object();
  letter.latin = "a";
  letter.uyghur = "\u0627";
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "b";
  letter.uyghur = "\u0628"; //b
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "s";
  letter.uyghur = "\u0633"; //s
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "d";
  (letter.uyghur = "\u062F"), //d
    alphabet.push(letter);

  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "f";
  letter.uyghur = "\u0641"; //f
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "g";
  letter.uyghur = "\u06AF"; //g
  alphabet.push(letter);

  //var letter = new Object();
  //letter.latin = "'g";
  //letter.uyghur = '\u06AF';   //g
  //alphabet.push(letter);

  var letter = new Object();
  letter.latin = "i";
  letter.uyghur = "\u0649"; //i
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "j";
  letter.uyghur = "\u062C"; //j
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "k";
  letter.uyghur = "\u0643"; //k
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "l";
  letter.uyghur = "\u0644"; //l
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "m";
  letter.uyghur = "\u0645"; //m
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "n";
  letter.uyghur = "\u0646"; //n
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "o";
  letter.uyghur = "\u0648"; //o
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "\u00F6";
  letter.uyghur = "\u06C6"; //o
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "p";
  letter.uyghur = "\u067E"; //p
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "ng";
  letter.uyghur = "\u06AD"; //ng
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "c";
  (letter.uyghur = "\u0686"), //q
    alphabet.push(letter);

  var letter = new Object();
  letter.latin = "r";
  letter.uyghur = "\u0631"; //r
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "s";
  letter.uyghur = "\u0633"; //s
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "t";
  letter.uyghur = "\u062A"; //t
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "u";
  letter.uyghur = "\u06C7"; //u
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "\u00FC";
  letter.uyghur = "\u06C8"; //v
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "w";
  letter.uyghur = "\u06CB"; //w
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "y";
  letter.uyghur = "\u064A"; //y
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "z";
  letter.uyghur = "\u0632"; //z
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "zh";
  letter.uyghur = "\u0698"; //zh
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "gh";
  letter.uyghur = "\u063A"; //gh
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = " ";
  letter.uyghur = " "; //space
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "?";
  letter.uyghur = "\u061F"; //?
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = ".";
  (letter.uyghur = "\u065C"), //.
    alphabet.push(letter);

  var letter = new Object();
  letter.latin = ",";
  letter.uyghur = "\u060C"; //,
  alphabet.push(letter);

  // if x is used as h in uyghur
  if (letter_h.value == "x") {
    var letter = new Object();
    letter.latin = "h";
    letter.uyghur = "\u06BE"; //h
    alphabet.push(letter);

    var letter = new Object();
    letter.latin = "x";
    letter.uyghur = "\u062E"; //x is h in uyghur
    alphabet.push(letter);
  } else {
    var letter = new Object();
    letter.latin = "h";
    letter.uyghur = "\u062E"; //x is h in uyghur
    alphabet.push(letter);

    var letter = new Object();
    letter.latin = "x";
    (letter.uyghur = "\u0634"), //sh as xam
      alphabet.push(letter);
  }

  if (letter_q.value == "ch") {
    var letter = new Object();
    letter.latin = "ch";
    (letter.uyghur = "\u0686"), //q
      alphabet.push(letter);

    var letter = new Object();
    letter.latin = "q";
    letter.uyghur = "\u0642"; // kh in hasim
    alphabet.push(letter);
  } else {
    var letter = new Object();
    letter.latin = "q";
    (letter.uyghur = "\u0686"), //q
      alphabet.push(letter);
  }

  if (letter_sh.value == "sh") {
    var letter = new Object();
    letter.latin = "sh";
    (letter.uyghur = "\u0634"), //sh as xam
      alphabet.push(letter);
  } else {
    var letter = new Object();
    letter.latin = "x";
    (letter.uyghur = "\u0634"), //sh as xam
      alphabet.push(letter);
  }

  if (letter_e.value == "e") {
    var letter = new Object();
    letter.latin = "e";
    letter.uyghur = "\u06D5"; //ë
    alphabet.push(letter);

    var letter = new Object();
    letter.latin = "\u00EB";
    letter.uyghur = "\u06D0"; //ë
    alphabet.push(letter);

    var letter = new Object();
    letter.latin = "\u00E9";
    letter.uyghur = "\u06D0"; //ë
    alphabet.push(letter);

    var letter = new Object();
    letter.latin = "\u00E8";
    letter.uyghur = "\u06D0"; //ë
    alphabet.push(letter);
  } else {
    var letter = new Object();
    letter.latin = "\u00EB";
    letter.uyghur = "\u06D5"; //ë
    alphabet.push(letter);

    var letter = new Object();
    letter.latin = "\u00E9";
    letter.uyghur = "\u06D5"; //ë
    alphabet.push(letter);

    var letter = new Object();
    letter.latin = "\u00E8";
    letter.uyghur = "\u06D5"; //ë
    alphabet.push(letter);

    var letter = new Object();
    letter.latin = "e";
    letter.uyghur = "\u06D0";
    alphabet.push(letter);
  }
  //letter_h.value;   letter h in uyghur

  var doubleLetterFound = new Boolean();
  doubleLetterFound = false;
  var srcTextarea = document.getElementById("note");
  var destTextarea = document.getElementById("converted_result");

  if (srcTextarea != null) {
    str = srcTextarea.value;
    str = str.toLowerCase();

    str2 = "";
    for (i = 0; i < str.length; i++) {
      //search double letters   (gh, ch, zh ....)
      if (i < str.length - 1) {
        //search double letter
        for (j = 0; j < alphabet.length; j++) {
          if (alphabet[j].latin == str.substring(i, i + 2)) {
            //str2 += "found double" + str.substring(i,i+2);
            doubleLetterFound = true;
            i++;
            break;
          }
        }
      }

      if (doubleLetterFound == false) {
        //search one letter
        for (j = 0; j < alphabet.length; j++) {
          if (alphabet[j].latin.charCodeAt(0) == str[i].charCodeAt(0)) {
            break;
          }
        }
      } else {
        doubleLetterFound = false;
      }
      //if the letter is found
      if (j < alphabet.length) {
        if (i == 0) {
          //if the first letter is a vowel, "emze" is added.
          if (
            alphabet[j].latin == "a" ||
            alphabet[j].latin == "e" ||
            alphabet[j].latin == "o" ||
            alphabet[j].latin == "u" ||
            alphabet[j].latin == "i" ||
            alphabet[j].latin == "\u00FC" ||
            alphabet[j].latin == "\u00F6" ||
            alphabet[j].latin == "\u00EB" ||
            alphabet[j].latin == "\u00E9" ||
            alphabet[j].latin == "\u00E8"
          ) {
            str2 += "\u0626";
          }
        } else {
          //if the first letter of the word is a vowel, "emze" is added.
          if (
            str[i - 1] == " " ||
            str[i - 1] == "\u000A" ||
            str[i - 1] == "'" ||
            str[i - 1] == "." ||
            str[i - 1] == "," ||
            str[i - 1] == ":" ||
            str[i - 1] == "?" ||
            str[i - 1] == '"'
          )
            if (
              alphabet[j].latin == "a" ||
              alphabet[j].latin == "e" ||
              alphabet[j].latin == "o" ||
              alphabet[j].latin == "u" ||
              alphabet[j].latin == "i" ||
              alphabet[j].latin == "\u00FC" ||
              alphabet[j].latin == "\u00F6" ||
              alphabet[j].latin == "\u00EB" ||
              alphabet[j].latin == "\u00E9" ||
              alphabet[j].latin == "\u00E8"
            ) {
              str2 += "\u0626";
            }
        }

        str2 += alphabet[j].uyghur;
      } else {
        //remove the syllable seperator '
        if (str[i] != "'") str2 += str[i];
      }
    }
  }

  console.log("ssssssssss" + str2 + "::::");
  //   Object.keys(destTextarea)

  destTextarea.value = str2;
  destTextarea.style.textAlign = "right";
}

function ConvertU2L() {
  var alphabet = new Array();

  var letter = new Object();
  letter.latin = "a";
  letter.uyghur = "\u0627";
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "b";
  letter.uyghur = "\u0628"; //b
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "s";
  letter.uyghur = "\u0633"; //s
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "d";
  (letter.uyghur = "\u062F"), //d
    alphabet.push(letter);

  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "f";
  letter.uyghur = "\u0641"; //f
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "g";
  letter.uyghur = "\u06AF"; //g
  alphabet.push(letter);

  //var letter = new Object();
  //letter.latin = "'g";
  //letter.uyghur = '\u06AF';   //g
  //alphabet.push(letter);

  var letter = new Object();
  letter.latin = "i";
  letter.uyghur = "\u0649"; //i
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "j";
  letter.uyghur = "\u062C"; //j
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "k";
  letter.uyghur = "\u0643"; //k
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "l";
  letter.uyghur = "\u0644"; //l
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "m";
  letter.uyghur = "\u0645"; //m
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "n";
  letter.uyghur = "\u0646"; //n
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "o";
  letter.uyghur = "\u0648"; //o
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "\u00F6";
  letter.uyghur = "\u06C6"; //o
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "p";
  letter.uyghur = "\u067E"; //p
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "ng";
  letter.uyghur = "\u06AD"; //ng
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "c";
  (letter.uyghur = "\u0686"), //q
    alphabet.push(letter);

  var letter = new Object();
  letter.latin = "r";
  letter.uyghur = "\u0631"; //r
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "s";
  letter.uyghur = "\u0633"; //s
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "t";
  letter.uyghur = "\u062A"; //t
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "u";
  letter.uyghur = "\u06C7"; //u
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "\u00FC";
  letter.uyghur = "\u06C8"; //v
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "w";
  letter.uyghur = "\u06CB"; //w
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "y";
  letter.uyghur = "\u064A"; //y
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "z";
  letter.uyghur = "\u0632"; //z
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "zh";
  letter.uyghur = "\u0698"; //zh
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = "gh";
  letter.uyghur = "\u063A"; //gh
  alphabet.push(letter);

  /*var letter = new Object();
    letter.latin = " ";
    letter.uyghur =  ' '; //space
    alphabet.push(letter);*/

  var letter = new Object();
  letter.latin = "?";
  letter.uyghur = "\u061F"; //?
  alphabet.push(letter);

  var letter = new Object();
  letter.latin = ".";
  (letter.uyghur = "\u065C"), //.
    alphabet.push(letter);

  var letter = new Object();
  letter.latin = ",";
  letter.uyghur = "\u060C"; //,
  alphabet.push(letter);

  // if x is used as h in uyghur
  if (letter_h.value == "x") {
    var letter = new Object();
    letter.latin = "h";
    letter.uyghur = "\u06BE"; //h
    alphabet.push(letter);

    var letter = new Object();
    letter.latin = "x";
    letter.uyghur = "\u062E"; //x is h in uyghur
    alphabet.push(letter);
  } else {
    var letter = new Object();
    letter.latin = "h";
    letter.uyghur = "\u062E"; //x is h in uyghur
    alphabet.push(letter);

    var letter = new Object();
    letter.latin = "x";
    (letter.uyghur = "\u0634"), //sh as xam
      alphabet.push(letter);
  }

  if (letter_q.value == "ch") {
    var letter = new Object();
    letter.latin = "ch";
    (letter.uyghur = "\u0686"), //q
      alphabet.push(letter);

    var letter = new Object();
    letter.latin = "q";
    letter.uyghur = "\u0642"; // kh in hasim
    alphabet.push(letter);
  } else {
    var letter = new Object();
    letter.latin = "q";
    (letter.uyghur = "\u0686"), //q
      alphabet.push(letter);
  }

  if (letter_sh.value == "sh") {
    var letter = new Object();
    letter.latin = "sh";
    (letter.uyghur = "\u0634"), //sh as xam
      alphabet.push(letter);
  } else {
    var letter = new Object();
    letter.latin = "x";
    (letter.uyghur = "\u0634"), //sh as xam
      alphabet.push(letter);
  }

  if (letter_e.value == "e") {
    var letter = new Object();
    letter.latin = "e";
    letter.uyghur = "\u06D5"; //ë
    alphabet.push(letter);

    var letter = new Object();
    letter.latin = "\u00EB";
    letter.uyghur = "\u06D0"; //ë
    alphabet.push(letter);

    var letter = new Object();
    letter.latin = "\u00E9";
    letter.uyghur = "\u06D0"; //ë
    alphabet.push(letter);

    var letter = new Object();
    letter.latin = "\u00E8";
    letter.uyghur = "\u06D0"; //ë
    alphabet.push(letter);
  } else {
    var letter = new Object();
    letter.latin = "\u00EB";
    letter.uyghur = "\u06D5"; //ë
    alphabet.push(letter);

    var letter = new Object();
    letter.latin = "\u00E9";
    letter.uyghur = "\u06D5"; //ë
    alphabet.push(letter);

    var letter = new Object();
    letter.latin = "\u00E8";
    letter.uyghur = "\u06D5"; //ë
    alphabet.push(letter);

    var letter = new Object();
    letter.latin = "e";
    letter.uyghur = "\u06D0";
    alphabet.push(letter);
  }
  //letter_h.value;   letter h in uyghur

  var doubleLetterFound = new Boolean();
  doubleLetterFound = false;

  var srcTextarea = document.getElementById("note");
  var dstTextarea = document.getElementById("converted_result");
  var lastLetterIsUyghur = false;
  if (srcTextarea != null) {
    str = srcTextarea.value;

    str2 = "";
    for (i = 0; i < str.length; i++) {
      //search one letter
      for (j = 0; j < alphabet.length; j++) {
        if (alphabet[j].uyghur.charCodeAt(0) == str[i].charCodeAt(0)) {
          break;
        }
      }

      //if the letter is found
      if (j < alphabet.length) {
        str2 += alphabet[j].latin;
        lastLetterIsUyghur = true;
      } else {
        console.log(str[i].charCodeAt(0));
        if (str[i].charCodeAt(0) != 1574) {
          str2 += str[i];
          lastLetterIsUyghur = false;
        } else {
          if (i > 0) {
            if (lastLetterIsUyghur == true) {
              str2 += "'";
            }
          }
        }

        lastLetterIsUyghur = false;
      }
    }
  }
  dstTextarea.value = str2;
  dstTextarea.style.textAlign = "left";
}
