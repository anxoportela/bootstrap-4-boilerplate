"use strict";
const app = {
  init() {
    app.start();
  },
  start() {
    // Iniciar Menu
    $.getScript("./assets/js/modules/mod-menu/mod-menu.js", function () {
      mkMenu();
    });
    // Iniciar Cuerpo
    $.getScript("./assets/js/modules/mod-cuerpo/mod-cuerpo.js", function () {
      mkCuerpo();
    });
    // Ejemplo uso de módulos
    $.getScript("./assets/js/modules/mod-ejemplo/mod-ejemplo.js", function () {
      moduloEjemplo();
    });
  }
};

$("document").ready(() => {
  app.init();
});
