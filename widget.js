(function (window, document) {
  "use strict";  /* Wrap code in an IIFE */
  var jQuery, $; // Localize jQuery variables

  function loadScript(url, callback) {
    /* Load script from url and calls callback once it's loaded */
    var scriptTag = document.createElement('script');
    scriptTag.setAttribute("type", "text/javascript");
    scriptTag.setAttribute("src", url);
    if (typeof callback !== "undefined") {
      if (scriptTag.readyState) {
        /* For old versions of IE */
        scriptTag.onreadystatechange = function () {
          if (this.readyState === 'complete' || this.readyState === 'loaded') {
            callback();
          }
        };
      } else {
        scriptTag.onload = callback;
      }
    }
    (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(scriptTag);
  }

  /**
   * Get the icon URL based on locale and SDG code
   * @param {number} sdgCode - The SDG code (1-17)
   * @param {string} locale - The current locale (e.g., 'en_US', 'es_ES')
   * @returns {string} The URL for the SDG icon
   */
  function getSDGIconUrl(sdgCode, locale) {
    // Check if locale starts with 'es' for Spanish
    // Ensure sdgCode is a number or numeric string
    var code = String(sdgCode || '').trim();
    if (code.length === 1) code = '0' + code; // pad single digits with leading zero
    if (locale && locale.toLowerCase().startsWith('es')) {
      return 'https://www.un.org/sustainabledevelopment/es/wp-content/uploads/sites/3/2019/09/S-WEB-Goal-' + code + '-150x150.png';
    }
    // Default to English
      return 'https://www.un.org/sustainabledevelopment/wp-content/uploads/2019/08/E-Goal-' + code + '-1024x1024.png';
  }

  /**
   * Get dataset label localized by locale
   * @param {string} locale
   * @returns {string}
   */
  function getDatasetLabel(locale) {
    if (locale && locale.toLowerCase().startsWith('es')) {
      return 'Predicción SDG';
    }
    return 'SDG prediction';
  }

  /**
   * Renders a single SDG item (icon + localized label + percentage) in the legend container.
   * Called on hover of a chart segment.
   */
  function renderHoverLegend(legendContainer, prediction, labels, locale) {
    legendContainer.innerHTML = '';

    const sdgCode = prediction.sdg.code;
    const percentage = (prediction.prediction * 100).toFixed(0);
    const label = (labels && labels[sdgCode - 1])
      ? labels[sdgCode - 1]
      : ('SDG ' + sdgCode + ': ' + prediction.sdg.name);

    const link = document.createElement('a');
    link.href = 'https://sdgs.un.org/goals/goal' + sdgCode;
    link.target = '_blank';
    link.style.display = 'flex';
    link.style.alignItems = 'center';
    link.style.textDecoration = 'none';
    link.style.color = 'inherit';
    link.style.padding = '6px 8px';

    const icon = document.createElement('img');
    icon.src = getSDGIconUrl(sdgCode, locale);
    icon.style.height = '50px';
    icon.style.width = '50px';
    icon.style.marginRight = '8px';
    icon.style.flexShrink = '0';

    const text = document.createElement('span');
    text.style.fontSize = '13px';
    text.textContent = label + ' (' + percentage + '%)';

    link.appendChild(icon);
    link.appendChild(text);
    legendContainer.appendChild(link);
  }

  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
    } else if (document.addEventListener) {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      document.attachEvent('onreadystatechange', function () {
        if (document.readyState === 'complete') callback();
      });
    }
  }

  function loadChartIfNeeded(callback) {
    if (window.Chart) {
      callback();
      return;
    }
    loadScript('https://cdn.jsdelivr.net/npm/chart.js@2.9.4/dist/Chart.min.js', function () {
      if (window.Chart) {
        callback();
      } else {
        console.error('SDG Plugin: Chart.js failed to load.');
      }
    });
  }

  function main() {
    ready(function () {
      loadChartIfNeeded(function () {
        var wheels = document.querySelectorAll('.sdg-wheel');
        if (!wheels || wheels.length === 0) {
          console.warn('SDG Plugin: no .sdg-wheel elements found.');
          return;
        }

        Array.prototype.forEach.call(wheels, function (div, i) {
          var text = (div.getAttribute('data-text') || '').replace('\n', '');
          var model = div.getAttribute('data-model');
          var height = parseInt(div.getAttribute('data-wheel-height'), 10) || 250;
          var labelsAttr = div.getAttribute('data-labels');
          var locale = div.getAttribute('data-locale');
          var labels = null;

          try {
            labels = labelsAttr ? JSON.parse(labelsAttr) : null;
          } catch (e) {
            console.error('SDG Plugin: error parsing labels', e);
          }

          if (!labels || !Array.isArray(labels) || labels.length < 17) {
            labels = [
              'SDG 1: No poverty',
              'SDG 2: Zero hunger',
              'SDG 3: Good health and well-being',
              'SDG 4: Quality Education',
              'SDG 5: Gender equality',
              'SDG 6: Clean water and sanitation',
              'SDG 7: Affordable and clean energy',
              'SDG 8: Decent work and economic growth',
              'SDG 9: Industry, innovation and infrastructure',
              'SDG 10: Reduced inequalities',
              'SDG 11: Sustainable cities and communities',
              'SDG 12: Responsible consumption and production',
              'SDG 13: Climate action',
              'SDG 14: Life below water',
              'SDG 15: Life in Land',
              'SDG 16: Peace, Justice and strong institutions',
              'SDG 17: Partnerships for the goals'
            ];
          }

          if (!model) {
            model = 'aurora-sdg-multi';
          }

          // Build canvas
          var canvas = document.createElement('canvas');
          canvas.height = height;
          canvas.width = height;
          canvas.id = 'sdg-wheel-canvas-' + i;
          canvas.style.display = 'block';
          // Important: CSS dimensions must match HTML attributes for Chart.js
          canvas.style.width = height + 'px';
          canvas.style.height = height + 'px';

          var imgSDG = new Image();
          if (locale && locale.toLowerCase().startsWith('es')) 
          imgSDG.src = "https://www.un.org/sustainabledevelopment/es/wp-content/uploads/sites/3/2019/09/S-SDG-logo-with-UN-Emblem_Square_WEB_transparent-300x238.png";
          else
            imgSDG.src = "https://www.un.org/sustainabledevelopment/wp-content/uploads/2019/08/E_SDG_logo_UN_emblem_square_trans_WEB-1024x879.png";
          imgSDG.alt = "SDG Logo";
          imgSDG.id = 'imgCentroSDG';
          var div_img = document.createElement('div');
          div_img.id = 'un-logo-container';
          div_img.appendChild(imgSDG);
          // Setup container style
          div.style.maxWidth = height + 'px';
          div.style.width = height + 'px';
          div.style.height = height + 'px';
          
          div.appendChild(canvas);
          div.appendChild(div_img);

          // Build hover legend container
          var legendDiv = document.createElement('div');
          legendDiv.className = 'sdg-legend';
          legendDiv.id = 'sdg-wheel-legend-' + i;
          
          div.id = 'sdg-wheel-div-' + i;
          div.appendChild(legendDiv);
          


          // Call classifier API
          var url = 'https://aurora-sdg.labs.vu.nl/classifier/classify/' + model;

          
          fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text }),
          })
            .then(function (response) {
              if (!response.ok) {
                throw new Error('SDG Plugin: classifier API returned status ' + response.status);
              }
              return response.json();
            })
            .then(function (data) {

              if (!data || !Array.isArray(data.predictions)) {
                throw new Error('SDG Plugin: invalid prediction response');
              }
              var predictionResponse = data;

              var predictions = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
              predictionResponse.predictions.forEach(function (value, index) {
                predictions[index] = value.prediction;
              });

              var datasetLabel = getDatasetLabel(locale);

              // 1. Creamos y precargamos la imagen FUERA del plugin

              if (typeof Chart !== 'undefined' && typeof window.Chart !== 'undefined') {

                try {

                  // Create Chart using the canvas element (Chart.js v2 prefers the canvas element)
                  var chartConfig = {
                    type: 'doughnut',
                    data: {
                      labels: labels,
                      datasets: [{
                        label: datasetLabel,
                        data: predictions,
                        backgroundColor: [
                          '#C42231', '#DDA73A', '#4E9E45', '#C31F2D', '#C63A21',
                          '#40A8C8', '#EBBD15', '#A21C44', '#CD5E22', '#C51C75',
                          '#DB8F20', '#BF8D2C', '#407F46', '#1F97D4', '#59BA47',
                          '#136A9F', '#14496B'
                        ],
                        hoverBackgroundColor: [
                          '#C42231', '#DDA73A', '#4E9E45', '#C31F2D', '#C63A21',
                          '#40A8C8', '#EBBD15', '#A21C44', '#CD5E22', '#C51C75',
                          '#DB8F20', '#BF8D2C', '#407F46', '#1F97D4', '#59BA47',
                          '#136A9F', '#14496B'
                        ],
                        borderColor: 'transparent',
                        borderWidth: 1
                      }]
                    },
                    options: {
                      responsive: true,
                      maintainAspectRatio: false,
                      animation: false,
                      cutoutPercentage: 65,
                      elements: { arc: { borderWidth: 0 } },
                      // Chart.js v2 uses 'legend' and 'tooltips' under options
                      legend: { display: false },
                      tooltips: { enabled: false },
                      // onHover signature for v2 is (event, activeElements)
                      onHover: function (event, activeElements) {
                        if (activeElements && activeElements.length > 0) {
                          var segmentIndex = activeElements[0]._index || activeElements[0].index;
                          var prediction = predictionResponse.predictions[segmentIndex];
                          if (prediction) {
                            renderHoverLegend(legendDiv, prediction, labels, locale);
                            legendDiv.style.pointerEvents = 'auto';
                            legendDiv.style.opacity = '1';
                          }
                        } else {
                          legendDiv.style.opacity = '0';
                          legendDiv.style.pointerEvents = 'none';
                          legendDiv.innerHTML = '';
                        }
                      }
                    }
                  };
                  
                  // Pass the canvas element instead of the 2D context to let Chart.js handle sizing
                  var myChart = new window.Chart(canvas, chartConfig);             

                  // Ensure chart renders
                  if (typeof myChart.update === 'function') myChart.update();

                  imgSDG.onload = () => {
                      if (myChart && typeof myChart.update === 'function') {
                          myChart.update();
                      }
                  };

                   // Fallback: attach mouse listeners to canvas and use Chart.js helper to detect hovered segments
                  try {
                    canvas.addEventListener('mousemove', function (evt) {
                      try {
                        var elems = myChart.getElementsAtEvent(evt) || [];
                        if (elems.length > 0) {
                          var idx = elems[0]._index !== undefined ? elems[0]._index : (elems[0].index !== undefined ? elems[0].index : elems[0]._datasetIndex);
                          var pred = predictionResponse.predictions[idx];
                          if (pred) {
                            renderHoverLegend(legendDiv, pred, labels, locale);
                            legendDiv.style.pointerEvents = 'auto';
                            legendDiv.style.opacity = '1';
                          }
                        } else {
                          legendDiv.style.opacity = '0';
                          legendDiv.style.pointerEvents = 'none';
                          legendDiv.innerHTML = '';
                        }
                      } catch (e) {
                        console.error('SDG Plugin: hover handler error', e);
                      }
                    });
                    canvas.addEventListener('mouseleave', function () {
                      legendDiv.style.opacity = '0';
                      legendDiv.style.pointerEvents = 'none';
                      legendDiv.innerHTML = '';
                    });
                  } catch (e) {
                    console.error('SDG Plugin: error attaching canvas hover listeners', e);
                  }

                  // No initial legend: show only on hover

                } catch (err) {
                  console.error('SDG Plugin: error creating chart:', err);
                }
              } else {
                console.error('SDG Plugin: Chart is not available. Chart type:', typeof window.Chart);
              }
            })
            .catch(function (err) {
              console.error('SDG Plugin: error fetching predictions:', err);
            });
        });
      });
    });
  }

  main();

}(window, document)); /* end IIFE */
