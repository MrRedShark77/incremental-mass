var app;

function loadVue() {
	app = new Vue({
	    el: "#app",
	    data: {
			player,
			format,
			formatMass,
			romanize,
			FUNCS,
			UPGS,
			MILESTONES,
			TABS,
			ACHIEVEMENTS,
        }
	})
}