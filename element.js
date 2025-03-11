!(function () { // IIFE so code can be included in any page/script without conflicts

    // ------------------------------------------------------------------------ Helper functions
    const createElement = (tag, props = {}) => Object.assign(document.createElement(tag), props)
    // ------------------------------------------------------------------------
    const span = (html, part) => `<span part="${part}">${html}</span>`

    // ************************************************************************ <city-temperature>
    customElements.define("city-temperature", class extends HTMLElement {
        // attributes:
        // lat, lon 
        // unit="F" Fahrenheit, default is Celsius
        // city="Amsterdam"
        // prefix="Current temperature in"    
        connectedCallback() {
            // ------------------------------------------------------------ display the component
            this
                .attachShadow({ mode: "open" })
                .append(
                // ------------------------------------------------------------ create the CSS
                    createElement("style", { innerHTML: `:host{display:inline-block}` }),
                    // ------------------------------------------------------------ create the HTML
                    (this.getAttribute("prefix") || "The temperature in"), " ",
                    (this.getAttribute("city") || "[no city]"), " is ",
                // ------------------------------------------------------------ create <location-temperature>
                    createElement("location-temperature", {
                        part: "city-temperature",
                        lat: this.getAttribute("lat"),
                        lon: this.getAttribute("lon"),
                        city: this.getAttribute("city"),
                        unit: this.getAttribute("unit"),
                    }),
            ) // append
        } // connectedCallback
    }) // define

    // ************************************************************************ <location-temperature>
    customElements.define("location-temperature", class extends HTMLElement {
        async connectedCallback() {
            // ---------------------------------------------------------------- get LAT LON properties or attribute from this scope
            let {
                lat = this.getAttribute("lat") || 52.366,
                lon = this.getAttribute("lon") || 4.904,
                unit = this.getAttribute("unit") || "C",
                city = this.getAttribute("city"),
            } = this;
            // ---------------------------------------------------------------- prepare API url geo-location
            let url;
            if (city) {
                url = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=10&language=en&format=json`
                const data = await (await fetch(url)).json()
                // get city lat,lon
                lat = data.results[0].latitude;
                lon = data.results[0].longitude;
            }
            // ---------------------------------------------------------------- fetch temperature by LAT , LON
            url = `https://api.open-meteo.com/v1/forecast` +
                `?latitude=${lat}&longitude=${lon}` +
                (unit == "F" ? `&temperature_unit=fahrenheit` : "") +
                `&current_weather=true`;
            // ---------------------------------------------------------------- fetch the data
            const data = await (await fetch(url)).json()
            // console.log(data)
            // ---------------------------------------------------------------- process the data
            if (data?.reason?.includes("one minute")) { // maximum requests per minute
                this.innerHTML = "🔄"
                setTimeout(() => this.connectedCallback(), 60000) // one minute
            } else if (data?.reason?.includes("Daily")) { // maximum requests per day
                this.innerHTML = span("🔒 daily API limit reached", "apierror")
            } else {
                // ------------------------------------------------------------ display the data
                this.innerHTML =
                    span(data.current_weather.temperature, "temperature") +
                    " " +
                    span(data.current_weather_units.temperature, "unit")
            }
        } // connectedCallback
    }); // define
    // ************************************************************************
}());