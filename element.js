!(function () {
    // ------------------------------------------------------------------------ Helper functions
    const createElement = (tag, props = {}) => Object.assign(document.createElement(tag), props)
    // ------------------------------------------------------------------------
    const span = (html, part) => `<span part="${part}">${html}</span>`
    // ************************************************************************ <city-temperature>
    customElements.define("city-temperature", class extends HTMLElement {
        // attributes: 
        // lat, lon 
        // or location="lat,lon"
        // unit="F" Fahrenheit, default is Celsius
        // city="Amsterdam"
        // prefix="Current temperature in"    
        connectedCallback() {
            // ------------------------------------------------------------ get LAT LON coordinates
            let [
                lat,
                lon = this.getAttribute("lon") || 4.904,
                unit = this.getAttribute("unit") || "C",
            ] = (this.getAttribute("location") || this.getAttribute("lat") || 52.366).split(",")
            // ------------------------------------------------------------ display the component
            this
                .attachShadow({ mode: "open" })
                .append(
                    createElement("style", { innerHTML: `:host{display:inline-block}` }),
                    this.getAttribute("prefix") || "The temperature in ",
                    this.getAttribute("city") || "", " is ",
                    createElement("location-temperature", {
                        part: "temperature",
                        lat, lon, unit
                    }),
                )
        }
    })
    // ************************************************************************ <location-temperature>
    customElements.define("location-temperature", class extends HTMLElement {
        async connectedCallback() {
            // ---------------------------------------------------------------- get LAT LON coordinates
            let {
                lat = this.getAttribute("lat") || console.error("No lat"),
                lon = this.getAttribute("lon") || console.error("No lon"),
                unit = this.getAttribute("unit") || "C",
            } = this;
            // ---------------------------------------------------------------- fetch the data
            const data = await (
                await fetch(
                    `https://api.open-meteo.com/v1/forecast` +
                    `?latitude=${lat}&longitude=${lon}` +
                    (unit == "F" ? `&temperature_unit=fahrenheit` : "") +
                    `&current_weather=true`,
                )
            ).json()
            // console.log(data)
            // ---------------------------------------------------------------- process the data
            if (data?.reason?.includes("one minute")) { // maximum requests per minute
                this.innerHTML = "🔄"
                setTimeout(() => this.connectedCallback(), 60000) // one minute
            } else {    
                // ------------------------------------------------------------ display the data
                this.innerHTML =
                    span(data.current_weather.temperature, "temperature") +
                    " " +
                    span(data.current_weather_units.temperature, "unit")
            }
        }
    });
}());