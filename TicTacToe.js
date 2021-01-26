var tour; // entier indiquant à qui c’est le tour, 1 pour "x", 2 pour "o"
var grille; // contenu de la grille de jeu, un 0 indique une case vide
var occupees; // nombre de cases occupées
var coups; // position des coups joués 
var nWinX = 0; //Stocker le nombre de victoires de X
var nWinO = 0; //Stocker le nombre de victoire de O
var nDraw = 0;
var botOn = false; //"true" quand on joue contre le bot

var autreJoueur = function(joueur) {
  return 3 - joueur;
};
var nomJoueur = function(joueur) {
  return (joueur == 1) ? "x" : "o";
};
var symboleJoueur = function(joueur) {
  return "<img src=\"player" + nomJoueur(joueur).toUpperCase() + ".svg\" width=50>";
};
var sym = function(id) {
  return grille[id];
};
var switchBot = function() {
  botOn ? botOn = false : botOn = true;
};
var updateWinner = function(winner) {
  (winner == 1) ? nWinX++ : nWinO++;
  if (nWinX > nWinO) {
    document.getElementById("x_score").className = "text-win";
    document.getElementById("o_score").className = "text-lose";
  } else if (nWinX < nWinO) {
    document.getElementById("x_score").className = "text-lose";
    document.getElementById("o_score").className = "text-win";
  } else {
    document.getElementById("x_score").className = "text-secondary";
    document.getElementById("o_score").className = "text-secondary";
  }
};

var alignements = [{
    pas: +1,
    departs: [0, 3, 6]
  },
  {
    pas: +3,
    departs: [0, 1, 2]
  },
  {
    pas: +4,
    departs: [0]
  },
  {
    pas: -2,
    departs: [6]
  }
];
var victoire = function() {
  for (var i = 0; i < alignements.length; i++) {
    var pas = alignements[i].pas;
    var departs = alignements[i].departs;
    for (var j = 0; j < departs.length; j++) {
      var pos = departs[j];
      if (sym(pos) != "") {
        for (var k = 1; k < 3; k++) {
          if (sym(pos) != sym(pos + k * pas))
            break;
        }
        if (k == 3) return sym(pos);
      }
    }
  }
  return "";
};
var clic = function(id) {
  if (grille[id] == 0) {
    grille[id] = tour;
    document.getElementById(id).innerHTML = symboleJoueur(tour);
    coups = coups.slice(0, occupees);
    coups.push(id);
    document.getElementById("undo").style.visibility = "visible";
    document.getElementById("redo").style.visibility = "hidden";
    var gagnant = victoire();
    if (gagnant != 0) {
      updateWinner(gagnant);
      setTimeout(()=>{
        alert(nomJoueur(gagnant) + " is the winner!");
        init();
      }, 10)
   
    } else {
      tour = autreJoueur(tour);
      if (++occupees == 9) {
        nDraw++;
        setTimeout(()=>{
          alert("match tie!");
          init();
        }, 10)
      } else if (tour == 2 && botOn) {
        clic(meilleurCoup());
      }
    }
  }
};
var init = function() {
  tour = 1;
  grille = Array(9).fill(0);
  occupees = 0;
  coups = [];
  for (var i = 0; i < 9; i++) {
    var elem = document.getElementById(i);
    elem.innerHTML = "";
  }
  document.getElementById("undo").style.visibility = "hidden";
  document.getElementById("redo").style.visibility = "hidden";
  document.getElementById("x_score").innerHTML = nWinX;
  document.getElementById("o_score").innerHTML = nWinO;
  document.getElementById("draw_score").innerHTML = nDraw;
  
};
var undo = function() {
  if (occupees > 0) {
    occupees--;
    grille[coups[occupees]] = 0;
    document.getElementById(coups[occupees]).innerHTML = "";
    tour = autreJoueur(tour);
    if (occupees == 0) {
      document.getElementById("undo").style.visibility = "hidden";
    }
    document.getElementById("redo").style.visibility = "visible";
  }
};
var redo = function() {
  if (occupees < coups.length) {
    grille[coups[occupees]] = tour;
    document.getElementById(coups[occupees]).innerHTML = symboleJoueur(tour);
    occupees++;
    tour = autreJoueur(tour);
    if (occupees == coups.length) {
      document.getElementById("redo").style.visibility = "hidden";
    }
    document.getElementById("undo").style.visibility = "visible";
  }
};
var meilleurCoup = function() {
  var valMax = -2;
  var posMax;
  for (var pos = 0; pos < 9; pos++) {
    if (grille[pos] == 0) {
      var val = valeurCoup(pos);
      if (val > valMax) {
        valMax = val;
        posMax = pos;
      }
    }
  }
  return posMax;
};
var valeurCoup = function(pos) {
  var val;
  grille[pos] = tour;
  occupees++;
  if (victoire() != 0) {
    val = +1; // victoire du joueur qui vient de jouer
  } else if (occupees == 9) {
    val = 0; // partie nulle
  } else {
    tour = autreJoueur(tour);
    val = -valeurCoup(meilleurCoup());
    tour = autreJoueur(tour);
  }
  grille[pos] = 0;
  occupees--;
  return val;
};