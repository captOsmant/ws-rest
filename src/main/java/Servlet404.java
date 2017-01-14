import utils.Console;

import javax.servlet.Servlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by CaptainOsmant on 14.01.2017.
 */
public class Servlet404 extends HttpServlet implements Servlet {

    private HashMap<String, String> redirects = new HashMap<String, String>();

    public Servlet404(){
        super();
        redirects.put("/api/places/([\\d]+)","/api/places/?id=$1");
        redirects.put("/api/reviews/([\\d]+)","/api/reviews/?id=$1");
        redirects.put("/api/token/([0-9a-gA-G]*)","/api/token/?token=$1");

    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res){




        try{
            PrintWriter writer = res.getWriter();

            String url = req.getAttribute("javax.servlet.forward.request_uri").toString();



            //Console.log(m.matches());

            Set<String> patterns = redirects.keySet();
            Iterator<String> it = patterns.iterator();
            while(it.hasNext()){
                String pattern = it.next();
                Pattern p = Pattern.compile(pattern);
                Matcher m = p.matcher(url);

                if(m.matches()){
                    //Console.log(url);
                    String output = m.replaceFirst(redirects.get(pattern));
                    Console.log("Redirected from "+url+" to "+output);
                    res.sendRedirect(output);
                    return;
                }

            }
            writer.write("Illegal request format!");
            writer.close();
            //res.sendRedirect("/api/places/?id=3");

        }catch (IOException e){
            Console.log(e.getMessage());
        }
    }
}
