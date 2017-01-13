import utils.DBConnection;

import javax.servlet.Servlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * Created by CaptainOsmant on 12.01.2017.
 */
public class PlacesServlet extends HttpServlet implements Servlet {
    public PlacesServlet(){
        super();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response){
        DBConnection con = new DBConnection();
        int city_id = Integer.valueOf(request.getParameter("id"));
        if(city_id <=0 ) return;

        try{
            ResultSet res = con.execSelect("SELECT * FROM places WHERE city_id="+city_id);
            String result = "";


            response.setContentType("application/json; Charset=utf-8");
            response.setCharacterEncoding("UTF-8");

            PrintWriter writer = response.getWriter();

            while(res.next()){
                String desc= res.getString(5).replaceAll("[\n]+","");

                result+="{" +
                        "\"id\":\""+res.getString(1)+"\"," +
                        "\"city_id\":\""+res.getString(2)+"\"," +
                        "\"name\":\""+res.getString(3)+"\"," +
                        "\"ru_name\":\""+res.getString(4)+"\"," +
                        "\"description\":\""+desc+"\"," +
                        "\"image_url\":\""+res.getString(6)+"\"," +
                        "\"lat\":\""+res.getString(7)+"\"," +
                        "\"lon\":\""+res.getString(8)+"\"" +
                        "}";

                //writer.print(desc);


                if(!res.isLast()){
                    result+=',';
                }
            }
            writer.print("[" + result + "]");
            writer.close();

        }catch (SQLException ex){
            System.out.println(ex.getMessage());
        }catch (IOException ex){
            System.out.println(ex.getMessage());
        }



    }
}
