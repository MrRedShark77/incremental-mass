var app;

function loadVue() {
	app = new Vue({
	    el: "#app",
	    data: {
			player,
			format,
			formatMass,
			romanize,
			greekAlp,
			FUNCS,
			UPGS,
			MILESTONES,
			CHALGREEK,
			TABS,
			ACHIEVEMENTS,
        }
	})
}