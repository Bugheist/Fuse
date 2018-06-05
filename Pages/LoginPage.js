function HomePage() {
	router.goto("home");
}
function SearchPage() {
	router.goto("search");
}
module.exports = {
	HomePage: HomePage,
	SearchPage: SearchPage,
	goBack: function() {
		router.goBack();
	}
};