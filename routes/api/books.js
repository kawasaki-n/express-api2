var express = require('express');
var router = express.Router();

const mysql = require('mysql2');
const connection_param = {
    "host": process.env.DB_HOSTNAME,
    "database": process.env.DB_NAME,
    "user": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD
}
const pool = mysql.createPool(connection_param);

router.get('/', function(req, res, next) {
    const sql = "select * from book order by id";
    pool.getConnection(
        // getConnectionされたら実行する関数
        (e, con) => {
            try {
                con.query(sql, (err, result, field) => {
                    if (err) {
                        throw err;
                    }
                    // console.log(result);
                    res.json(result);
                })
            } catch(error) {
                console.log(error);
            } finally {
                if (con) {
                    con.release();
                }
            }
        }
    );
});

// curl -X POST -H "Content-Type: application/json" -d '{"name":"hoge", "author":"kawasaki", "url":"http://google.com"}' http://localhost:8080/api/books
router.post('/', function(req, res, next) {
    const sql = "insert into book (name, author, url, reg_time, update_time) values(?, ?, ?, now(), now())";
    pool.getConnection((e, con) => {
        try {
            con.query(sql, [req.body.name, req.body.author, req.body.url], (e, r, f) => {
                if (e) {
                    throw e;
                }
                res.json({
                    insertedId: r.insertId,
                    message: "Success!"
                });
            })
        } catch (error) {
            console.log(error);
            res.send("データ登録中にエラーが発生しました。");
        } finally {
            if (con) {
                con.release();
            }
        }
    });
});

// curl -X DELETE http://localhost:8080/api/books/2
router.delete('/:id', function(req, res, next) {
    const sql = "delete from book where id = ?";
    const id = req.params.id;
    pool.getConnection((e, con) => {
        try {
            con.query(sql, [id], (e, r, f) => {
                if (e) {
                    throw e;
                }
                console.log(r);
                res.json({
                    deleteId: id,
                    message: "Success!"
                })
            })
        } catch (error) {
            console.log(error);
            res.send("データ削除中にエラーが発生しました。");
        } finally {
            if (con) {
                con.release();
            }
        }
    });
})

module.exports = router;
