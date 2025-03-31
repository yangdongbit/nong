import rawAreaData from 'china-area-data';

// 转换数据格式
function transformAreaData() {
  const provinces = [];
  
  // 省份
  Object.keys(rawAreaData['86']).forEach(provinceCode => {
    const province = {
      code: provinceCode,
      name: rawAreaData['86'][provinceCode],
      children: []
    };

    // 城市
    const cities = rawAreaData[provinceCode];
    if (cities) {
      Object.keys(cities).forEach(cityCode => {
        const city = {
          code: cityCode,
          name: cities[cityCode],
          children: []
        };

        // 区县
        const districts = rawAreaData[cityCode];
        if (districts) {
          Object.keys(districts).forEach(districtCode => {
            city.children.push({
              code: districtCode,
              name: districts[districtCode]
            });
          });
        }

        province.children.push(city);
      });
    }

    provinces.push(province);
  });

  return provinces;
}

export const areaData = transformAreaData();