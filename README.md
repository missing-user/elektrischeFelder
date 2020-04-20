# Elektrische Felder
Nachdem das Physik Semester wieder begonnen hat und wir jetzt Elektrische Felder behandeln, dachte ich wäre ein guter Zeitpunkt um eine kleine Simulation dafür zu schreiben. Es können statische und bewegliche Ladungen per Click positioniert werden, die Farben zeigen die resultierende Feldstäreke an. 
Das einzig interessante aus programmiertechnischer Sicht ist, dass Physik und Rendering in seperaten Worker Threads laufen um nicht den Main JS Thread zu belasten und die Website responsive zu halten.
