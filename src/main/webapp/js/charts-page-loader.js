function drawChart() {
  fetch("/moviechart").then((response) => response.json())
    .then((movieJson) => {
      const movieData = new google.visualization.DataTable();
      // define columns for the DataTable instance
      movieData.addColumn('string', 'Movie Title');
      movieData.addColumn('number', 'Audience Score %');
      movieData.addColumn('number', 'Worldwide Gross ($)');
      movieData.addColumn('string', 'Genre');
      movieData.addColumn('number', 'Profitability');

      for (let i = 0; i < movieJson.length; i++) {
        movieRow = [];
        movieRow.push(movieJson[i]['Film'], Number(movieJson[i]['Audience score %']),
                      Number(movieJson[i]['Worldwide Gross']), movieJson[i]['Genre'],
                      Number(movieJson[i]['Profitability']));

        movieData.addRow(movieRow);
      }
      const chartOptions = {
        title: 'Correlation between Audience Score, Worldwide Gross and Profitability of some movies',
        hAxis: {title: 'Audience Score', viewWindow: {min: 30, max: 100}},
        vAxis: {title: 'Worldwide Gross'},
        bubble: {textStyle: {fontSize: 11}}
      };
      const movieChart = new google.visualization.BubbleChart(document.getElementById('movie_chart'));
      movieChart.draw(movieData, chartOptions);
    })
}

/** Fetches data and populates the UI of the page. */
function buildUI() {
  google.charts.load('current', {packages: ['corechart']});
  google.charts.setOnLoadCallback(drawChart);
}