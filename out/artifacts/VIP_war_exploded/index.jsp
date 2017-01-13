<%@ page import="java.util.ArrayList" %>
<!doctype html>
<html>
    <head>
        <meta charset="'utf-8"/>
    </head>

    <body>
        <h1>Hello there!</h1>
        <ol>
        <%
            ArrayList<String> codes = (ArrayList) request.getAttribute("codes");
            if(codes == null) return;
            for(int i=0; i<codes.size();i++){
                %><li><%=codes.get(i)%></li><%
            }
        %>
        </ol>
    </body>
</html>