const svg = d3.select("#chart");
const width = +svg.attr("width");
const height = +svg.attr("height");
const margin = { top: 20, right: 20, bottom: 40, left: 60 };

const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

let playing = false;
let timeIndex = 0;
let timer;
let type = "activity";

const xScale = d3.scaleLinear().domain([0, 1440 * 14]).range([0, innerWidth]);
const yScale = d3.scaleLinear().range([innerHeight, 0]);

const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

const tooltip = d3.select("body").append("div").attr("class", "tooltip").style("display", "none");

Promise.all([
  d3.csv("data/Mouse_Fem_Act.csv"),
  d3.csv("data/Mouse_Fem_Temp.csv")
]).then(([actData, tempData]) => {
  const dataMap = {};
  actData.forEach((d, i) => {
    Object.entries(d).forEach(([id, value]) => {
      if (!dataMap[id]) dataMap[id] = [];
      dataMap[id][i] = { activity: +value };
    });
  });
  tempData.forEach((d, i) => {
    Object.entries(d).forEach(([id, value]) => {
      if (dataMap[id] && dataMap[id][i]) {
        dataMap[id][i].temperature = +value;
        dataMap[id][i].minute = i;
      }
    });
  });

  const mice = Object.entries(dataMap);

//   yScale.domain(d3.extent(mice.flatMap(([_, d]) => d.map(e => e[type]))));
if (type === "temperature") {
    yScale.domain([35, 40]);
  } else {
    yScale.domain(d3.extent(mice.flatMap(([_, d]) => d.map(e => e[type]))));
  }
  

    // X Axis
  g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(xScale).ticks(14).tickFormat(d => `Day ${Math.floor(d / 1440) + 1}`));

  // Y Axis
  g.append("g")
    .attr("class", "y-axis")
    .call(
      d3.axisLeft(yScale)
        .ticks(type === "temperature" ? 5 : null)
        .tickFormat(type === "temperature" ? d3.format(".1f") : null)
    );

  const dots = g.selectAll("circle")
    .data(mice.map(([id, values]) => ({ id, values })))
    .enter()
    .append("circle")
    .attr("r", 4);

  function render() {
    dots
      .attr("cx", d => xScale(d.values[timeIndex]?.minute))
    //   .attr("cx", (d, i) => (i + 1) * (innerWidth / (mice.length + 1)))

      .attr("cy", d => yScale(d.values[timeIndex]?.[type]))
      .attr("fill", d => colorScale(d.id))
      .on("mouseover", function (event, d) {
        tooltip.style("display", "block")
          .html(`ID: ${d.id}<br>${type}: ${d.values[timeIndex]?.[type].toFixed(2)}`);
        d3.select(this).attr("r", 6);
      })
      .on("mousemove", function (event) {
        tooltip.style("left", `${event.pageX + 5}px`).style("top", `${event.pageY - 28}px`);
      })
      .on("mouseout", function () {
        tooltip.style("display", "none");
        d3.select(this).attr("r", 4);
      });
  }

  function step() {
    if (timeIndex >= 1440 * 14 - 1) {
      clearInterval(timer);
      playing = false;
      return;
    }
    timeIndex++;
    render();
  }

  d3.select("#play-button").on("click", () => {
    if (!playing) {
      timer = setInterval(step, 30);
      playing = true;
    }
  });

  d3.select("#pause-button").on("click", () => {
    clearInterval(timer);
    playing = false;
  });

  d3.select("#type-select").on("change", function () {
    type = this.value;
    // yScale.domain(d3.extent(mice.flatMap(d => d.values.map(v => v[type]))));
    if (type === "temperature") {
        yScale.domain([35, 40
            
        ]);
      } else {
        yScale.domain(d3.extent(mice.flatMap(d => d.values.map(v => v[type]))));
      }      
      
    // g.select("g").call(d3.axisLeft(yScale));
    g.select(".y-axis").call(

        d3.axisLeft(yScale)
          .ticks(type === "temperature" ? 5 : null)
          .tickFormat(type === "temperature"
            ? d3.format(".1f") // one decimal for °C
            : null)
      );
      
    render();
  });

  render();
});
