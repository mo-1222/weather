let weather = document.querySelector('.weather'),
    weatherMax = document.querySelector('.weatherMax'),
    locate = document.querySelector('.locate'),
    inputBox = document.querySelector('.text'),
    search = document.querySelector('.search'),
    empty = document.querySelector('.empty'),
    btn = document.querySelector('.btn'),
    tips = document.querySelector('.tips'),
    off = document.querySelector('.off'),
    example = document.querySelectorAll('.example'),
    iconMax = document.querySelector('.iconMax'),
    state = document.querySelector('.state'),
    forecast = document.querySelector('.forecast'),
    weatherMin = document.querySelector('.weatherMin'),
    city = document.querySelector('.city'),
    iconMin = document.querySelector('.iconMin'),
    temp = document.querySelector('.temp');

let defaultCity = localStorage.getItem('defaultCity'),
    key = '';


weather.onclick = function()
{
    weatherMax.style.display = 'block';
}
weather.onmouseleave = function()
{
    weatherMax.style.display = 'none';
}


locate.onclick = getCity;
btn.onclick = function()
{
    if(search.value === '')
    {
        inputBox.classList.toggle('width');
        search.focus();
    }
    else
    {
        updateCity(search.value);
        inputBox.classList.remove('width');
        search.value = '';
    }
}
empty.onclick = function()
{
    search.value = '';
    search.focus();
}
search.onclick = function()
{
    let defaultOff = localStorage.getItem('defaultOff');
    if(!defaultOff)
    {
        tips.style.transform = 'scale(1)';
    }
}
off.onclick = function()
{
    tips.style.transform = 'scale(0)';
    localStorage.setItem('defaultOff', 'off');
}
for(let i = 0; i < example.length; i++)
{
    example[i].onclick = function(e)
    {
        updateCity(e.target.textContent);
        tips.style.transform = 'scale(0)';
        inputBox.classList.add('width');
        search.value = e.target.textContent;
        search.focus();
    }
}
if(!defaultCity)
{
    getCity();
}
else
{
    showCity();
}

function getCity()
{
    let script = document.createElement('script');
    script.src = 'https://api.map.baidu.com/api?v=3.0&ak=6yAoynmTPNlTBa8z1X4LfwGE&callback=cityData';
    document.body.appendChild(script);

    window.cityData = function()
    {
        let city = new BMap.LocalCity();
        city.get(updateCity);
    }
}
function updateCity(defaultCity)
{
    defaultCity = typeof defaultCity === 'object' && defaultCity !== null ? defaultCity.name : defaultCity;
    localStorage.setItem('defaultCity', defaultCity);
    showCity();
}
function showCity()
{
    let location = localStorage.getItem('defaultCity');
    ajax('https://geoapi.qweather.com/v2/city/lookup?', location, '城市信息');
}
function ajax(api, location, action, airQuality)
{
    $.ajax(
            {
                type: 'GET',
                url: api,
                data: {
                        location: location,
                        key: key
                      },
                dataType: 'json',
                success: function(res)
                {
                    if(action === '城市信息')
                    {
                        let info = {
                                        id: res.location[0].id,
                                        name: res.location[0].name,
                                        longitude: res.location[0].lon.replace(/(\.\d{2})\d*$/, '$1'),
                                        latitude: res.location[0].lat.replace(/(\.\d{2})\d*$/, '$1')
                                   };
                        localStorage.setItem('defaultInfo', JSON.stringify(info));

                        let defaultInfo = JSON.parse(localStorage.getItem('defaultInfo'));
                        ajax('https://devapi.qweather.com/v7/air/now?', defaultInfo.id, '空气质量');
                    }
                    else if(action === '空气质量')
                    {
                        ajax('https://devapi.qweather.com/v7/weather/now?', location, '城市天气', res.now.category);
                    }
                    else if(action === '城市天气')
                    {
                        let defaultInfo = JSON.parse(localStorage.getItem('defaultInfo'));
                        city.textContent = defaultInfo.name;
                        iconMin.src = formatIcon(res.now.icon);
                        temp.textContent = `${res.now.temp}°C`;
                        iconMax.src = formatIcon(res.now.icon);
                        state.textContent = `${defaultInfo.name}\u3000${res.now.text}\u3000${res.now.temp}°C\u3000${airQuality}`;

                        ajax('https://devapi.qweather.com/v7/minutely/5m?', `${defaultInfo.longitude},${defaultInfo.latitude}`, '分钟预报');
                    }
                    else if(action === '分钟预报')
                    {
                        forecast.textContent = res.summary;

                        let defaultInfo = JSON.parse(localStorage.getItem('defaultInfo'));
                        ajax('https://devapi.qweather.com/v7/air/5d?', defaultInfo.id, '空气质量3天');
                    }
                    else if(action === '空气质量3天')
                    {
                        let arr = [
                                    {grade: res.daily[0].category},
                                    {grade: res.daily[1].category},
                                    {grade: res.daily[2].category}
                                  ];
                        ajax('https://devapi.qweather.com/v7/weather/3d?', location, '城市天气3天', arr);
                    }
                    else if(action === '城市天气3天')
                    {
                        let date = new Date(),
                            h = date.getHours(),
                            arr = [
                                    {
                                        day: '今天',
                                        icon: formatIcon(icon = h >= 6 && h < 18 ? res.daily[0].iconDay : res.daily[0].iconNight),
                                        text: text = h >= 6 && h < 18 ? res.daily[0].textDay : res.daily[0].textNight,
                                        temp: `${res.daily[0].tempMin}~${res.daily[0].tempMax}°C`,
                                        airQuality: airQuality[0].grade,
                                        color: formatColor(airQuality[0].grade)
                                    },
                                    {
                                        day: '明天',
                                        icon: formatIcon(icon = h >= 6 && h < 18 ? res.daily[1].iconDay : res.daily[1].iconNight),
                                        text: text = h >= 6 && h < 18 ? res.daily[1].textDay : res.daily[1].textNight,
                                        temp: `${res.daily[1].tempMin}~${res.daily[1].tempMax}°C`,
                                        airQuality: airQuality[1].grade,
                                        color: formatColor(airQuality[1].grade)
                                    },
                                    {
                                        day: '后天',
                                        icon: formatIcon(icon = h >= 6 && h < 18 ? res.daily[2].iconDay : res.daily[2].iconNight),
                                        text: text = h >= 6 && h < 18 ? res.daily[2].textDay : res.daily[2].textNight,
                                        temp: `${res.daily[2].tempMin}~${res.daily[2].tempMax}°C`,
                                        airQuality: airQuality[2].grade,
                                        color: formatColor(airQuality[2].grade)
                                    }
                                  ];
                        $('.weatherMax .everyday').remove();
                        for(let i = 0; i < arr.length; i++)
                        {
                            let html = `
                                            <div class="everyday">
                                                    <div class="day">${arr[i].day}</div>
                                                    <div class="icon_temp">
                                                            <input type="image" src="${arr[i].icon}" class="icon">
                                                            <div class="tempMin_tempMax">\u3000${arr[i].text}\u3000${arr[i].temp}</div>
                                                    </div>
                                                    <div class="airQuality" style="color: ${arr[i].color}">${arr[i].airQuality}</div>
                                            </div>
                                       `;
                            weatherMax.insertAdjacentHTML('beforeend', html);
                        }
                    }
                }
            }
          )
}
function formatIcon(icon)
{
    let iconMap = {
                    '100': `image/${icon}.png`,
                    '101': `image/${icon}.png`,
                    '104': `image/${icon}.png`,
                    '150': `image/${icon}.png`,
                    '151': `image/${icon}.png`,
                    '300': `image/${icon}.png`,
                    '302': `image/${icon}.png`,
                    '305': `image/${icon}.png`,
                    '306': `image/${icon}.png`,
                    '307': `image/${icon}.png`,
                    '310': `image/${icon}.png`,
                    '311': `image/${icon}.png`,
                    '312': `image/${icon}.png`,
                    '313': `image/${icon}.png`,
                    '314': `image/${icon}.png`,
                    '315': `image/${icon}.png`,
                    '316': `image/${icon}.png`,
                    '317': `image/${icon}.png`,
                    '318': `image/${icon}.png`,
                    '350': `image/${icon}.png`,
                    '399': 'image/305.png',
                    '400': `image/${icon}.png`,
                    '401': `image/${icon}.png`,
                    '402': `image/${icon}.png`,
                    '403': `image/${icon}.png`,
                    '404': `image/${icon}.png`,
                    '406': `image/${icon}.png`,
                    '407': `image/${icon}.png`,
                    '408': `image/${icon}.png`,
                    '409': `image/${icon}.png`,
                    '410': `image/${icon}.png`,
                    '456': `image/${icon}.png`,
                    '457': `image/${icon}.png`,
                    '501': `image/${icon}.png`,
                    '502': `image/${icon}.png`,
                    '503': `image/${icon}.png`,
                    '504': `image/${icon}.png`,
                    '507': `image/${icon}.png`,
                    '508': `image/${icon}.png`,
                    '509': `image/${icon}.png`,
                    '510': `image/${icon}.png`,
                    '511': `image/${icon}.png`,
                    '512': `image/${icon}.png`,
                    '513': `image/${icon}.png`,
                    '514': `image/${icon}.png`,
                    '515': `image/${icon}.png`,
                    'default': 'image/default.png'
                  };
    return iconMap[icon] || iconMap['default'];
}
function formatColor(color)
{
    let colorMap = {
                        '优': '#95B359',
                        '良': '#A9A538',
                        '轻度污染': '#E0991D',
                        '中度污染': '#D96161',
                        '重度污染': '#A257D0',
                        '严重污染': '#D94371'
                   };
    return colorMap[color];
}