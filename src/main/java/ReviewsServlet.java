import utils.DBConnection;

import javax.servlet.Servlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Map;

/**
 * Created by CaptainOsmant on 12.01.2017.
 */
public class ReviewsServlet extends HttpServlet implements Servlet {
    public ReviewsServlet(){
        super();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response){
        Map<String, String[]> params;

        response.setContentType("application/json; Charset=UTF-8");
        response.setCharacterEncoding("UTF-8");

        try {
            request.setCharacterEncoding("UTF-8");
            //System.out.println(request.getParameter("content"));

        }catch(UnsupportedEncodingException e){
            System.out.println(e.getMessage());
        }
        params = request.getParameterMap();
        try{
            PrintWriter writer = response.getWriter();
            DBConnection con = new DBConnection();
            //System.out.println("INSERT INTO reviews VALUES(default,'"+params.get("name")[0]+"','"+params.get("mark")[0]+"','"+params.get("content")[0]+"',NOW(),'"+params.get("place")[0]+"')");
            con.execUpdate("INSERT INTO reviews VALUES(default,'" + params.get("name")[0] + "','" + params.get("mark")[0] + "','" + params.get("content")[0] + "',NOW(),'" + params.get("place")[0] + "')");
            writer.write("{\"status\":\"OK\",\"message\":\"Successfully Done!\"}");
            writer.close();
        }catch(IOException e){
            System.out.println(e.getMessage());
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response){

        response.setContentType("application/json; Charset=UTF-8");
        response.setCharacterEncoding("UTF-8");

        int id = Integer.valueOf(request.getParameter("id"));

        try{
            PrintWriter writer = response.getWriter();
            DBConnection con = new DBConnection();

            ResultSet res = con.execSelect("SELECT * FROM reviews WHERE place_id="+id);
            String result = "";
            while(res.next()){
                result+="{" +
                        "\"id\":\""+res.getString(1)+"\"," +
                        "\"name\":\""+res.getString(2)+"\"," +
                        "\"mark\":\""+res.getString(3)+"\"," +
                        "\"text\":\""+res.getString(4)+"\"," +
                        "\"leaved\":\""+res.getString(5)+"\"," +
                        "\"place_id\":\""+res.getString(6)+"\"" +
                        "}";

                if(!res.isLast()){
                    result+=",";
                }
            }

            writer.write("["+result+"]");
            writer.close();

        }catch(IOException e){
            System.out.println(e.getMessage());
        }catch(SQLException e){

            System.out.println(e.getMessage());
        }

    }
}
