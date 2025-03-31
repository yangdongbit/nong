import pandas as pd
from sqlalchemy import create_engine
from config import DB_CONFIG

def load_data_from_mysql(table_name="farms"):
    """从MySQL加载数据"""
    try:
        engine = create_engine(
            f"mysql+pymysql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@"
            f"{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}?"
            f"charset={DB_CONFIG['charset']}"
        )
        return pd.read_sql(f"SELECT * FROM {table_name}", engine)
    except Exception as e:
        print(f"数据库连接失败: {e}")
        raise