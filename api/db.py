import pymysql

def get_db_connection():
    connection = pymysql.connect(
        host='fit-bit-db.crw42c42c8er.us-east-1.rds.amazonaws.com',
        user='admin',
        password='Fazal15102001',
        database='fitnesstracker1' ,
        cursorclass=pymysql.cursors.DictCursor 
    )
    return connection
