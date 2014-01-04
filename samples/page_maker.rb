for i in 0..20
  text = <<EOS
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title>Earthbound Battle Backgrounds</title>
<link rel="stylesheet" href="/assets/styles.css" type="text/css">
<link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">

<script type="text/javascript">

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-46624461-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

</script>
</head>
<body>
<h1>Earthbound Battle Backgrounds</h1>
<p>Presented here for the first time online (?) are all 52,650 <em>potential</em> Earthbound/Mother 2 battle backgrounds. Click any square to see the full-size image. (I'm not sure why some have black borders.) The images on this page won't distort and are static.</p>
<p>This site is intended as a reference companion to the <a href="http://gjtorikian.github.io/Earthbound-Battle-Backgrounds-JS/">JavaScript simulation</a>, the <a href="https://github.com/gjtorikian/Earthbound-Battle-Backgrounds">Android live wallpaper app</a>, the <a href="http://forum.starmen.net/forum/Fan/Games/Kraken-EB-Battle-Animation-Screensaver/first">Earthbound battle animation screensaver</a>, as well as any general Earthbound/Mother 2 fan.</p>

<div id="navcontainer">
<ul>
<li><a href="set1.html">Set 1: 0 - 15</a></li>
<li><a href="set2.html">Set 2: 16 - 31</a></li>
<li><a href="set3.html">Set 3: 32 - 47</a></li>
<li><a href="set4.html">Set 4: 48 - 63</a></li>
<li><a href="set5.html">Set 5: 64 - 79</a></li>
<li><a href="set6.html">Set 6: 80 - 95</a></li>
<li><a href="set7.html">Set 7: 96 - 111</a></li>
<li><a href="set8.html">Set 8: 112 - 127</a></li>
<li><a href="set9.html">Set 9: 128 - 143</a></li>
<li><a href="set10.html">Set 10: 144 - 159</a></li>
<li><a href="set11.html">Set 11: 160 - 175</a></li>
<li><a href="set12.html">Set 12: 176 - 191</a></li>
<li><a href="set13.html">Set 13: 192 - 207</a></li>
<li><a href="set14.html">Set 14: 208 - 223</a></li>
<li><a href="set15.html">Set 15: 224 - 239</a></li>
<li><a href="set16.html">Set 16: 240 - 255</a></li>
<li><a href="set17.html">Set 17: 256 - 271</a></li>
<li><a href="set18.html">Set 18: 272 - 287</a></li>
<li><a href="set19.html">Set 19: 288 - 303</a></li>
<li><a href="set20.html">Set 20: 304 - 319</a></li>
<li><a href="set21.html">Set 21: 320 - 326</a></li>
</ul>
</div>
EOS

  layer_lower = i * 16
  layer_upper = layer_lower + 15

  # printing tragically cut short.
  if i == 20
    layer_lower = 320
    layer_upper = 326
  end

  text << "<h2>Set #{i + 1}: #{layer_lower} - #{layer_upper}</h2>\n"
  text << "<table width='190' border='1'>\n<tr>\n"
  text << "<th></th>"
  for l1 in layer_lower..layer_upper
    text << "<th width='50' scope='col'>#{l1}</th>\n"
  end
  text << "</tr>\n"

  for l2 in 0..326
    text << "<tr>\n"
    text << "<td class='row-indicator'>#{l2}</td>"
    for l1 in layer_lower..layer_upper
      l1_text = l1.to_s
      l2_text = l2.to_s
      l1_padding_length = 3 - l1.to_s.length
      l2_padding_length = 3 - l2.to_s.length
      l1_padding_length.times { l1_text.insert(0, "0")} 
      l2_padding_length.times { l2_text.insert(0, "0")}
      text << "<td><div class='container'><a href='http://s3.amazonaws.com/eb_bb/layer1_#{l1_text}_layer2_#{l2_text}.png' target='_blank'><img src='http://s3.amazonaws.com/eb_bb/layer1_#{l1_text}_layer2_#{l2_text}.png' width='150' height='150' />Layer 1: #{l1}<br/>Layer 2: #{l2}</a></div></td>\n"
    end
    text << "<tr>\n"
  end
  text <<"</table></body></html>"

  File.open("set#{i + 1}.html", 'w') { |file| file.write(text) }
end