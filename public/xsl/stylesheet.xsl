<?xml version="1.0" encoding="UTF-8"?>
<html xsl:version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<head>
  <link rel="stylesheet" href="/css/bootstrap.css" />
  <link rel="stylesheet" href="/css/style.css" />

  <script src="/js/context-menu.js" type="text/javascript"></script>
</head>
<body>
  <div class="container">
    <p style="padding-left: 8px; padding-top: 10px;"><a href="/">Click here</a> to go back to Dashboard.</p>
    <xsl:for-each select="user">
      <div style="background-color: 44cc00; color: white; padding: 12px">
        <span style="font-weight:bold">User information for: </span><xsl:value-of select="username"/>
      </div>
      <div style="padding-top: 5px; padding-left: 9px">
        <p>Username: <xsl:value-of select="username"/></p>
        Email: <span style="font-style:italic"><xsl:value-of select="email"/></span>
      </div>
    </xsl:for-each>
  </div>
</body>

<!-- Custom right click menu -->
<nav id="contextMenu" class="context-menu">
  <ul class="list-group">
    <li class="list-group-item">
      <a href="#" class="context-menu-btn" onclick="window.history.back()">Go Back</a>
    </li>
  </ul>
</nav>
</html>
