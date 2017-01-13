import auth.Auth;
import utils.Console;
import utils.DBConnection;

import javax.servlet.Servlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.sql.ResultSet;
import java.util.Map;

/**
 * Created by CaptainOsmant on 13.01.2017.
 */
public class CountriesServlet extends HttpServlet implements Servlet {
    public CountriesServlet(){
        super();
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res){
        res.setCharacterEncoding("UTF-8");
        res.setContentType("application/json; Charset=UTF-8");

        DBConnection con = new DBConnection();
        ResultSet set = con.execSelect("SELECT * FROM countries");

        try{
            String result = "";
            while(set.next()){

                result+="{" +
                        "\"name\":\""+set.getString(1)+"\"," +
                        "\"ru_name\":\""+set.getString(2)+"\"," +
                        "\"code\":\""+set.getString(3)+"\"," +
                        "\"id\":\""+set.getString(4)+"\"" +
                        "}";
                if(!set.isLast()){
                    result+=",";
                }
            }

            PrintWriter writer = res.getWriter();
            writer.write("["+result+"]");
            writer.close();

        }catch(Exception e){
            System.out.println(e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res){

        Map<String, String[]> params;
        try {
            req.setCharacterEncoding("UTF-8");
            params = req.getParameterMap();

            String token="";
            token = params.get("token")[0];

            PrintWriter writer = res.getWriter();
            if(!Auth.allowedModerate(token)){
                writer.write("{\"message\":\"Access error!\"}");
            }else{
                DBConnection con = new DBConnection();
                if(con.execUpdate("INSERT INTO countries VALUES (" +
                        "'"+params.get("name")[0]+"'," +
                        "'"+params.get("ru_name")[0]+"'," +
                        "'"+params.get("code")[0]+"'," +
                        " DEFAULT)")) {

                    writer.write("{\"message\":\"New line added!\"}");
                }else{
                    writer.write("{\"message\":\"This country already exists!\"}");
                }
            }
            writer.close();

        }catch(UnsupportedEncodingException e){
            Console.log(e.getMessage());
        }catch(IOException e){
            System.out.println(e.getMessage());
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse res){
        int id = Integer.valueOf(req.getParameter("id"));
        String token = req.getParameter("token");

        try {
            PrintWriter writer = res.getWriter();
            if (Auth.allowedAdministrate(token)) {

                DBConnection con = new DBConnection();
                con.execUpdate("DELETE FROM countries WHERE id=" + id);
                writer.write("{\"status\":\"OK\"}");

            }else{
                writer.write("{\"status\":\"UNAUTHORIZED\"}");

            }
            writer.close();
        }catch (IOException e){
            Console.log(e.getMessage());
        }

    }
}
