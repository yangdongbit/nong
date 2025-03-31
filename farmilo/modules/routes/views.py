from flask import Blueprint, render_template

# 创建蓝图
views_blueprint = Blueprint('views', __name__)

# @views_blueprint.route('/')
# def index():
#     """渲染主页"""
#     return render_template('index.html')