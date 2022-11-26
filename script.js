const solveButton = document.getElementById("solve-button")
const problemStatement = document.querySelector(".problem-statement");
const filterInput = document.getElementById("filter-rating");
const contestId = document.getElementById("contestID");
const problemID = document.getElementById("problemID");
const problemRating = document.getElementById("problem-rating");



console.log("Trying to get a new Problem...");

// global variable to store the problem URL.
var problemURL;


/**
 * If the current date is different than the date stored in localStorage, then update localStorage with
 * the current date and return true. Otherwise, return false
 * @returns a boolean value.
 */
function hasOneDayPassed() {
	var date = new Date().toLocaleDateString();

	if (localStorage.previousDate == date)
		return false;

	localStorage.previousDate = date;
	return true;
}

/**
 * It fetches the data from the codeforces api and returns the problems.
 * @returns An array of objects.
 */
async function fetchCodeforcesProblemData() {
	// using codeforces api to fetch problems
	const response = await fetch('https://codeforces.com/api/problemset.problems');
	const data = await response.json();

	return data.result.problems;
}

/**
 * It takes a list of problems and returns a random problem from the list
 * @param problemList - an array of objects, each object contains the following properties:
 * @returns The selected problem is being returned.
 */
function getOneProblem(problemList) {
	const index = Math.floor(Math.random() * problemList.length);
	const selectedProblem = problemList[index];

	if (selectedProblem !== {} && selectedProblem !== undefined) {
		// using localStorage to store the selected problem
		localStorage.selectedProblem = JSON.stringify(selectedProblem);

		// codeforces link is created and stored
		problemURL = `https://codeforces.com/problemset/problem/${selectedProblem.contestId}/${selectedProblem.index}`;
	}

	return selectedProblem;
}

/**
 * It updates the HTML elements on the page with the data from the selected problem.
 * @param selectedProblem - The problem object that is selected from the list of problems.
 */
function updateHTML(selectedProblem) {
	if (selectedProblem !== {} && selectedProblem !== undefined) {
		// Updating the problem statement and problem details on the page
		problemStatement.innerText = selectedProblem.name;
		contestId.innerText = selectedProblem.contestId;
		problemID.innerText = selectedProblem.index;
		problemRating.innerText = selectedProblem.rating;

		problemURL = `https://codeforces.com/problemset/problem/${selectedProblem.contestId}/${selectedProblem.index}`;
	}
}

async function updateProblemByRating() {
	// fetching input from filter
	const filterRating = Number(filterInput.value);

	// obtaining problem for the day from the list of problems
	const problemList = await fetchCodeforcesProblemData();

	// filtering problems based on rating
	const filterProblemsList = problemList.filter(item => item.rating === filterRating);

	// selecting a problem the list
	const selectedProblem = getOneProblem(filterProblemsList);

	updateHTML(selectedProblem);

	// clearing filter input
	filterInput.value = null;

	console.log(selectedProblem);
}


// Updates the visitor counter
async function updateVisitorCounter() {
	try {
		const isExistingVisitor = !!localStorage.getItem("isExistingVisitor");

		if (isExistingVisitor) {
			const visitsResponse = await fetch("https://api.countapi.xyz/get/codeforces-probem-of-the-day.netlify.app/992ab16e-4a82-4d30-a834-a62af433f862");
			const visits = await visitsResponse.json();
			document.querySelector('#visitors > span.number').innerText = visits.value;
		} else {
			const visitsResponse = await fetch("https://api.countapi.xyz/hit/codeforces-probem-of-the-day.netlify.app/992ab16e-4a82-4d30-a834-a62af433f862");
			const visits = await visitsResponse.json();
			document.querySelector('#visitors > span.number').innerText = visits.value;
			localStorage.setItem("isExistingVisitor", uuid())
		}
	} catch (error) {
		console.error("Something went wrong. Trying to fetch last known number of visits again...");
		const visitsResponse = await fetch("https://api.countapi.xyz/get/codeforces-probem-of-the-day.netlify.app/992ab16e-4a82-4d30-a834-a62af433f862");
		const visits = await visitsResponse.json();
		document.querySelector('#visitors > span.number').innerHTML = visits.value;
	}
}

// Snippet from https://stackoverflow.com/a/2117523/10165585
// Returns a UUID string
function uuid() {
	return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
		(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
	);
}


async function updateProblem() {
	// checking if old problem data is existing, if exists display it.
	if (localStorage.selectedProblem) {
		// parsing object data from localstorage
		const selectedProblem = localStorage.selectedProblem == undefined ? {} : JSON.parse(localStorage.selectedProblem);

		updateHTML(selectedProblem);
	}

	// checking one day condition, if this check passes the new problem is fetched.
	if (!hasOneDayPassed()) return false;

	// obtaining problem for the day from the list of problems
	const problemList = await fetchCodeforcesProblemData();

	// selecting a problem the list
	const selectedProblem = getOneProblem(problemList);

	updateHTML(selectedProblem);

	// console the problem details on every new problem fetch
	console.log(selectedProblem);
}

// on every page load, it tries to update the problem
window.addEventListener('DOMContentLoaded', updateProblem);

// On every page load, it tries to update the visitor counter
window.addEventListener('DOMContentLoaded', updateVisitorCounter);

// keep checking every minute, and trying to load a new problem
setInterval(updateProblem, 60000);

function enterIntoTheProblem() {
	window.open(problemURL, "_blank");
}

solveButton.addEventListener("click", enterIntoTheProblem);

