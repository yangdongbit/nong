from flask import Flask
from flask_cors import CORS
from modules.database.connector import load_data_from_mysql
from modules.routes.api import api_blueprint
from modules.routes.views import views_blueprint


from modules.algorithm.recommender import (
    get_recommendations,
    load_data_from_mysql,
    clean_url
)

app = Flask(__name__, static_folder='static', static_url_path='/static')
# 允许所有路径的所有类型请求的跨域访问
CORS(app, supports_credentials=True)

app.register_blueprint(api_blueprint)
app.register_blueprint(views_blueprint)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)