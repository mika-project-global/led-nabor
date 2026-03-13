import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Complete Czech FAQ questions
const czQuestions = {
  installation_1_q: "Jak připravit strop před instalací LED pásku?",
  installation_1_a: "Povrch by měl být čistý, suchý a odmaštěný. Odstraňte prach, nečistoty a jakékoli znečištění. Pokud je povrch porézní nebo nerovný, doporučuje se nejprve nalepit malířskou pásku pro lepší přilnavost LED pásku. Teplota povrchu by měla být nejméně 15°C pro optimální výkon lepidla.",
  installation_2_q: "Jak umístit napájecí zdroj a ovladač?",
  installation_2_a: "Napájecí zdroj a ovladač by měly být umístěny na dostupném místě pro údržbu. Zajistěte dobré větrání, aby nedošlo k přehřátí. Doporučuje se nainstalovat je alespoň 20 cm od LED pásku a nezakrývat je dekorativními prvky, které by mohly bránit chlazení.",
  installation_3_q: "Je nutné při instalaci pásku dělat odstup od stěn?",
  installation_3_a: "Ano, doporučuje se odstup 5-7 cm od stěn. To vytváří rovnoměrnější osvětlení a zabraňuje jasným skvrnám na stěnách. Odstup je také nutný pro kompenzaci tepelné roztažnosti pásku při zahřátí.",
  installation_4_q: "Jak správně spojit více segmentů pásku?",
  installation_4_a: "Pro spojení segmentů použijte speciální konektory nebo pájení. Při použití konektorů se ujistěte, že kontakty jsou čisté a bezpečně upevněné. Při pájení použijte kvalitní cín a nepřehřívejte pásek. Po spojení zkontrolujte spolehlivost kontaktu a funkčnost všech segmentů.",
  technical_1_q: "Lze LED pásek řezat?",
  technical_1_a: "Ano, LED pásky lze řezat, ale pouze na speciálně označených místech (obvykle každých 5 cm pro RGB a 2,5 cm pro bílé pásky). Na pásku jsou speciální značky ve formě nůžek nebo řezných linií. Řežte přesně středem kontaktních ploch ostrými nůžkami.",
  technical_2_q: "Jaká je maximální délka pásku z jednoho napájecího zdroje?",
  technical_2_a: "Maximální délka závisí na výkonu napájecího zdroje a spotřebě pásku. Pro pásky 7,2 W/m je maximální délka z jednoho napájecího zdroje 10 metrů; pro pásky 14,4 W/m - 5 metrů. Pokud je potřeba větší délka, použijte další napájecí zdroje nebo zesilovače signálu.",
  technical_3_q: "Jak vypočítat potřebný výkon napájecího zdroje?",
  technical_3_a: "Vynásobte délku pásku jeho výkonem na metr a přidejte 20% rezervu. Například pro 5metrový pásek s výkonem 7,2 W/m: 5 × 7,2 = 36 W, +20% = 43,2 W. Vyberte napájecí zdroj s nejbližším vyšším výkonem, v tomto případě 45 nebo 50 W.",
  technical_4_q: "Proč může LED pásek blikat?",
  technical_4_a: "Blikání může nastat z několika důvodů: nedostatečný výkon napájecího zdroje, špatný kontakt ve spojeních, porucha ovladače nebo rušení od jiných elektrických zařízení. Zkontrolujte všechna spojení, ujistěte se, že napájecí zdroj odpovídá požadovanému výkonu a že poblíž nejsou žádné zdroje rušení.",
  warranty_1_q: "Co mám dělat, když část pásku přestane fungovat?",
  warranty_1_a: "Nejprve zkontrolujte všechna spojení a ujistěte se, že napájecí zdroj funguje správně. Pokud problém není v tom, kontaktujte naši podporu. V případě tovární vady vyměníme vadný pásek v rámci záruky zdarma. Uschovejte si účtenku a záruční list k potvrzení nákupu.",
  warranty_2_q: "Co pokrývá záruka?",
  warranty_2_a: "Záruka pokrývá tovární vady: selhání LED diod, odlepení pásku od podkladu, poruchu napájecího zdroje nebo ovladače při správném použití. Záruka nepokrývá mechanické poškození a případy nesprávné instalace nebo provozu.",
  warranty_3_q: "Jak prodloužit životnost LED pásku?",
  warranty_3_a: "Pro maximální životnost: zajistěte dobré větrání, nepřekračujte jmenovité napětí, vyhněte se mechanickému poškození, pravidelně čistěte od prachu, zabraňte přehřátí. Při správném použití může životnost dosáhnout až 10 let.",
  delivery_1_q: "Jak probíhá doprava po Evropě?",
  delivery_1_a: "Doprava je zdarma po celé Evropě, protože náklady jsou již zahrnuty v ceně produktu. Pro doručení používáme spolehlivé přepravní společnosti DPD a GLS. Doba doručení je 3-7 pracovních dnů v závislosti na zemi. Každá objednávka je pečlivě zabalena pro bezpečnou přepravu. Stav doručení můžete sledovat prostřednictvím svého osobního účtu nebo čísla zásilky.",
  delivery_2_q: "Proč je doprava zdarma?",
  delivery_2_a: "Zahrnuli jsme náklady na dopravu do ceny každého produktu, abychom proces nákupu učinili co nejtransparentnějším a nejpohodlnějším pro naše zákazníky. To vám umožňuje okamžitě vidět konečnou cenu produktu bez dalších nákladů na dopravu, bez ohledu na zemi doručení v rámci Evropy. Tento přístup také zjednodušuje proces objednávání a činí naše ceny konkurenceschopnějšími.",
  delivery_3_q: "Do kterých zemí doručujete?",
  delivery_3_a: "Doručujeme do všech zemí Evropské unie, stejně jako do Spojeného království, Švýcarska a Norska. Doba doručení se může lišit v závislosti na zemi: Česká republika - 1-2 dny, sousední země (Slovensko, Polsko, Německo, Rakousko) - 2-4 dny, ostatní země EU - 3-7 dnů. Doručení je přímo ke dveřím.",
  delivery_4_q: "Jak mohu sledovat svou objednávku?",
  delivery_4_a: "Po odeslání objednávky obdržíte email se sledovacím číslem. Pomocí tohoto čísla můžete sledovat pohyb balíku na webu přepravní společnosti (DPD nebo GLS). Navíc vás náš manažer informuje o klíčových fázích doručení: potvrzení objednávky, předání dopravní službě, očekávané datum doručení.",
  delivery_5_q: "Jaké dokumenty jsou poskytovány při doručení?",
  delivery_5_a: "S každou objednávkou obdržíte kompletní sadu dokumentů: záruční list, návod k instalaci ve vašem jazyce, prodejní účtenku. Pro společnosti poskytujeme všechny potřebné účetní doklady včetně faktury. Veškerá dokumentace je poskytována v jazyce země doručení nebo v angličtině na požádání.",
  delivery_6_q: "Jak je produkt zabalen pro doručení?",
  delivery_6_a: "Používáme speciální ochranný obal: každá sada je umístěna v pevné krabici s tlumícími vložkami chránícími před nárazy a vibracemi. LED pásek a elektronické komponenty jsou navíc chráněny antistatickými sáčky. Vnější obal má vodotěsnou vrstvu a označení \"Křehké!\". Všechny komponenty jsou uvnitř krabice bezpečně upevněny.",
  delivery_7_q: "Co mám dělat, pokud produkt dorazí poškozený?",
  delivery_7_a: "V nepravděpodobném případě obdržení poškozeného zboží: 1) Okamžitě zdokumentujte poškození fotografiemi/videem a poznamenejte to v dodacím listu. 2) Kontaktujte nás telefonicky nebo emailem do 24 hodin. 3) Zorganizujeme bezplatný návrat a výměnu produktu. Všechny náklady na návrat a výměnu hradíme my. Výměna probíhá co nejrychleji, obvykle do 1-3 pracovních dnů.",
  delivery_8_q: "Je možné expresní doručení?",
  delivery_8_a: "Ano, můžeme zorganizovat expresní doručení pro naléhavé objednávky. V rámci Prahy je k dispozici doručení týž den pro objednávky zadané před 12:00. Pro ostatní města v České republice a sousedních zemích je možné doručení následující den. Náklady na expresní doručení jsou zahrnuty v ceně produktu. Pro ověření dostupnosti expresního doručení ve vašem regionu nás prosím kontaktujte."
};

// Complete German FAQ questions
const deQuestions = {
  installation_1_q: "Wie bereite ich die Decke vor der LED-Streifen-Installation vor?",
  installation_1_a: "Die Oberfläche sollte sauber, trocken und entfettet sein. Entfernen Sie Staub, Schmutz und jegliche Verschmutzung. Wenn die Oberfläche porös oder uneben ist, wird empfohlen, zuerst Malerband anzubringen, um die Haftung des LED-Streifens zu verbessern. Die Oberflächentemperatur sollte mindestens 15°C betragen, damit der Klebstoff optimal haftet.",
  installation_2_q: "Wie sollte ich das Netzteil und den Controller positionieren?",
  installation_2_a: "Das Netzteil und der Controller sollten an einem zugänglichen Ort für die Wartung platziert werden. Sorgen Sie für gute Belüftung, um Überhitzung zu vermeiden. Es wird empfohlen, sie mindestens 20 cm vom LED-Streifen entfernt zu installieren und sie nicht mit dekorativen Elementen abzudecken, die die Kühlung behindern könnten.",
  installation_3_q: "Benötige ich einen Abstand zu den Wänden bei der Installation des Streifens?",
  installation_3_a: "Ja, es wird ein Abstand von 5-7 cm zu den Wänden empfohlen. Dies schafft eine gleichmäßigere Beleuchtung und verhindert helle Flecken an den Wänden. Der Abstand ist auch notwendig, um die thermische Ausdehnung des Streifens bei Erwärmung zu kompensieren.",
  installation_4_q: "Wie verbinde ich mehrere Streifensegmente richtig?",
  installation_4_a: "Verwenden Sie zum Verbinden von Segmenten spezielle Steckverbinder oder Löten. Bei der Verwendung von Steckverbindern stellen Sie sicher, dass die Kontakte sauber und sicher befestigt sind. Beim Löten verwenden Sie hochwertiges Lötzinn und überhitzen Sie den Streifen nicht. Überprüfen Sie nach dem Verbinden die Zuverlässigkeit des Kontakts und die Funktionsfähigkeit aller Segmente.",
  technical_1_q: "Kann der LED-Streifen geschnitten werden?",
  technical_1_a: "Ja, LED-Streifen können geschnitten werden, aber nur an speziell markierten Stellen (normalerweise alle 5 cm für RGB und 2,5 cm für weiße Streifen). Der Streifen hat spezielle Markierungen in Form von Scheren oder Schnittlinien. Schneiden Sie genau durch die Mitte der Kontaktflächen mit einer scharfen Schere.",
  technical_2_q: "Was ist die maximale Länge des Streifens von einem Netzteil?",
  technical_2_a: "Die maximale Länge hängt von der Netzteilleistung und dem Stromverbrauch des Streifens ab. Für 7,2 W/m Streifen beträgt die maximale Länge von einem Netzteil 10 Meter; für 14,4 W/m Streifen - 5 Meter. Wenn eine größere Länge benötigt wird, verwenden Sie zusätzliche Netzteile oder Signalverstärker.",
  technical_3_q: "Wie berechne ich die erforderliche Netzteilleistung?",
  technical_3_a: "Multiplizieren Sie die Streifenlänge mit seiner Leistung pro Meter und fügen Sie 20% Reserve hinzu. Zum Beispiel für einen 5-Meter-Streifen mit 7,2 W/m Leistung: 5 × 7,2 = 36 W, +20% = 43,2 W. Wählen Sie ein Netzteil mit der nächsthöheren Leistung, in diesem Fall 45 oder 50 W.",
  technical_4_q: "Warum könnte der LED-Streifen flackern?",
  technical_4_a: "Flackern kann aus mehreren Gründen auftreten: unzureichende Netzteilleistung, schlechter Kontakt in Verbindungen, Controller-Fehlfunktion oder Störungen von anderen elektrischen Geräten. Überprüfen Sie alle Verbindungen, stellen Sie sicher, dass das Netzteil der erforderlichen Leistung entspricht und dass keine Störquellen in der Nähe sind.",
  warranty_1_q: "Was soll ich tun, wenn ein Teil des Streifens nicht mehr funktioniert?",
  warranty_1_a: "Überprüfen Sie zuerst alle Verbindungen und stellen Sie sicher, dass das Netzteil korrekt funktioniert. Wenn das Problem woanders liegt, kontaktieren Sie unseren Support. Im Falle eines Fabrikfehlers ersetzen wir den defekten Streifen kostenlos im Rahmen der Garantie. Bewahren Sie Ihre Quittung und Garantiekarte auf, um den Kauf zu bestätigen.",
  warranty_2_q: "Was deckt die Garantie ab?",
  warranty_2_a: "Die Garantie deckt Fabrikfehler ab: LED-Ausfall, Ablösung des Streifens von der Basis, Netzteil- oder Controller-Ausfall bei ordnungsgemäßer Verwendung. Die Garantie deckt keine mechanischen Schäden und Fälle unsachgemäßer Installation oder Bedienung ab.",
  warranty_3_q: "Wie kann ich die Lebensdauer des LED-Streifens verlängern?",
  warranty_3_a: "Für maximale Lebensdauer: sorgen Sie für gute Belüftung, überschreiten Sie nicht die Nennspannung, vermeiden Sie mechanische Beschädigungen, reinigen Sie regelmäßig von Staub, verhindern Sie Überhitzung. Bei ordnungsgemäßer Verwendung kann die Lebensdauer bis zu 10 Jahre erreichen.",
  delivery_1_q: "Wie läuft die Lieferung in Europa ab?",
  delivery_1_a: "Die Lieferung ist in ganz Europa kostenlos, da die Kosten bereits im Produktpreis enthalten sind. Wir nutzen zuverlässige Transportunternehmen DPD und GLS für die Lieferung. Die Lieferzeit beträgt 3-7 Werktage je nach Land. Jede Bestellung wird sorgfältig verpackt für einen sicheren Transport. Sie können den Lieferstatus über Ihr persönliches Konto oder über die Sendungsnummer verfolgen.",
  delivery_2_q: "Warum ist die Lieferung kostenlos?",
  delivery_2_a: "Wir haben die Lieferkosten in den Preis jedes Produkts einbezogen, um den Kaufprozess so transparent und bequem wie möglich für unsere Kunden zu gestalten. Dies ermöglicht es Ihnen, sofort den Endpreis des Produkts ohne zusätzliche Lieferkosten zu sehen, unabhängig vom Lieferland innerhalb Europas. Dieser Ansatz vereinfacht auch den Bestellprozess und macht unsere Preise wettbewerbsfähiger.",
  delivery_3_q: "In welche Länder liefern Sie?",
  delivery_3_a: "Wir liefern in alle Länder der Europäischen Union sowie nach Großbritannien, in die Schweiz und nach Norwegen. Die Lieferzeiten können je nach Land variieren: Tschechische Republik - 1-2 Tage, Nachbarländer (Slowakei, Polen, Deutschland, Österreich) - 2-4 Tage, andere EU-Länder - 3-7 Tage. Die Lieferung erfolgt bis zur Haustür.",
  delivery_4_q: "Wie kann ich meine Bestellung verfolgen?",
  delivery_4_a: "Nach dem Versand Ihrer Bestellung erhalten Sie eine E-Mail mit einer Tracking-Nummer. Mit dieser Nummer können Sie die Bewegung des Pakets auf der Website des Transportunternehmens (DPD oder GLS) verfolgen. Außerdem informiert Sie unser Manager über wichtige Lieferphasen: Auftragsbestätigung, Übergabe an den Lieferdienst, erwartetes Lieferdatum.",
  delivery_5_q: "Welche Dokumente werden mit der Lieferung bereitgestellt?",
  delivery_5_a: "Mit jeder Bestellung erhalten Sie ein vollständiges Dokumentenpaket: Garantiekarte, Installationsanleitung in Ihrer Sprache, Kaufbeleg. Für Unternehmen stellen wir alle erforderlichen Buchhaltungsunterlagen einschließlich einer Rechnung bereit. Alle Unterlagen werden in der Sprache des Lieferlandes oder auf Englisch auf Anfrage bereitgestellt.",
  delivery_6_q: "Wie ist das Produkt für die Lieferung verpackt?",
  delivery_6_a: "Wir verwenden spezielle Schutzverpackungen: jedes Set wird in eine stabile Kartonschachtel mit stoßdämpfenden Einlagen gelegt, die vor Stößen und Vibrationen schützen. Der LED-Streifen und elektronische Komponenten sind zusätzlich durch antistatische Beutel geschützt. Die Außenverpackung hat eine wasserfeste Schicht und eine \"Zerbrechlich!\"-Markierung. Alle Komponenten sind sicher im Inneren der Schachtel befestigt.",
  delivery_7_q: "Was soll ich tun, wenn das Produkt beschädigt ankommt?",
  delivery_7_a: "Im unwahrscheinlichen Fall des Erhalts beschädigter Ware: 1) Dokumentieren Sie den Schaden sofort mit Fotos/Videos und vermerken Sie dies im Lieferschein. 2) Kontaktieren Sie uns telefonisch oder per E-Mail innerhalb von 24 Stunden. 3) Wir organisieren eine kostenlose Rücksendung und Produktersatz. Alle Kosten für Rücksendung und Ersatz übernehmen wir. Der Ersatz erfolgt so schnell wie möglich, normalerweise innerhalb von 1-3 Werktagen.",
  delivery_8_q: "Ist Express-Lieferung möglich?",
  delivery_8_a: "Ja, wir können Express-Lieferung für dringende Bestellungen arrangieren. Innerhalb von Prag ist Same-Day-Lieferung für Bestellungen verfügbar, die vor 12:00 Uhr aufgegeben werden. Für andere Städte in der Tschechischen Republik und Nachbarländer ist Next-Day-Lieferung möglich. Die Kosten für Express-Lieferung sind im Produktpreis enthalten. Um die Verfügbarkeit von Express-Lieferung in Ihrer Region zu prüfen, kontaktieren Sie uns bitte."
};

// Complete Polish FAQ questions
const plQuestions = {
  installation_1_q: "Jak przygotować sufit przed instalacją taśmy LED?",
  installation_1_a: "Powierzchnia powinna być czysta, sucha i odtłuszczona. Usuń kurz, brud i wszelkie zanieczyszczenia. Jeśli powierzchnia jest porowata lub nierówna, zaleca się najpierw nakleić taśmę malarską dla lepszej przyczepności taśmy LED. Temperatura powierzchni powinna wynosić co najmniej 15°C dla optymalnej wydajności kleju.",
  installation_2_q: "Jak umieścić zasilacz i kontroler?",
  installation_2_a: "Zasilacz i kontroler powinny być umieszczone w dostępnym miejscu dla serwisowania. Zapewnij dobrą wentylację, aby zapobiec przegrzaniu. Zaleca się zainstalowanie ich w odległości co najmniej 20 cm od taśmy LED i nie zakrywanie ich elementami dekoracyjnymi, które mogłyby utrudniać chłodzenie.",
  installation_3_q: "Czy przy instalacji taśmy potrzebny jest odstęp od ścian?",
  installation_3_a: "Tak, zalecany jest odstęp 5-7 cm od ścian. To tworzy bardziej równomierne oświetlenie i zapobiega jasnym plamom na ścianach. Odstęp jest również konieczny do kompensacji rozszerzalności cieplnej taśmy podczas nagrzewania.",
  installation_4_q: "Jak prawidłowo połączyć wiele segmentów taśmy?",
  installation_4_a: "Do łączenia segmentów użyj specjalnych złączy lub lutowania. Przy użyciu złączy upewnij się, że styki są czyste i bezpiecznie przymocowane. Przy lutowaniu używaj wysokiej jakości cyny lutowniczej i nie przegrzewaj taśmy. Po połączeniu sprawdź niezawodność kontaktu i funkcjonalność wszystkich segmentów.",
  technical_1_q: "Czy taśmę LED można ciąć?",
  technical_1_a: "Tak, taśmy LED można ciąć, ale tylko w specjalnie oznaczonych miejscach (zazwyczaj co 5 cm dla RGB i 2,5 cm dla białych taśm). Taśma ma specjalne oznaczenia w postaci nożyczek lub linii cięcia. Tnij ściśle przez środek płytek kontaktowych ostrymi nożyczkami.",
  technical_2_q: "Jaka jest maksymalna długość taśmy z jednego zasilacza?",
  technical_2_a: "Maksymalna długość zależy od mocy zasilacza i zużycia energii taśmy. Dla taśm 7,2 W/m maksymalna długość z jednego zasilacza wynosi 10 metrów; dla taśm 14,4 W/m - 5 metrów. Jeśli potrzebna jest większa długość, użyj dodatkowych zasilaczy lub wzmacniaczy sygnału.",
  technical_3_q: "Jak obliczyć wymaganą moc zasilacza?",
  technical_3_a: "Pomnóż długość taśmy przez jej moc na metr i dodaj 20% rezerwy. Na przykład dla 5-metrowej taśmy o mocy 7,2 W/m: 5 × 7,2 = 36 W, +20% = 43,2 W. Wybierz zasilacz o najbliższej wyższej mocy, w tym przypadku 45 lub 50 W.",
  technical_4_q: "Dlaczego taśma LED może migotać?",
  technical_4_a: "Migotanie może występować z kilku powodów: niewystarczająca moc zasilacza, zły kontakt w połączeniach, usterka kontrolera lub zakłócenia od innych urządzeń elektrycznych. Sprawdź wszystkie połączenia, upewnij się, że zasilacz odpowiada wymaganej mocy i że w pobliżu nie ma źródeł zakłóceń.",
  warranty_1_q: "Co zrobić, gdy część taśmy przestanie działać?",
  warranty_1_a: "Najpierw sprawdź wszystkie połączenia i upewnij się, że zasilacz działa poprawnie. Jeśli problem nie leży w tym, skontaktuj się z naszym wsparciem. W przypadku wady fabrycznej wymienimy wadliwą taśmę na podstawie gwarancji bezpłatnie. Zachowaj paragon i kartę gwarancyjną, aby potwierdzić zakup.",
  warranty_2_q: "Co obejmuje gwarancja?",
  warranty_2_a: "Gwarancja obejmuje wady fabryczne: awarie diod LED, oderwanie taśmy od podłoża, awarie zasilacza lub kontrolera przy prawidłowym użytkowaniu. Gwarancja nie obejmuje uszkodzeń mechanicznych i przypadków niewłaściwej instalacji lub eksploatacji.",
  warranty_3_q: "Jak przedłużyć żywotność taśmy LED?",
  warranty_3_a: "Dla maksymalnej żywotności: zapewnij dobrą wentylację, nie przekraczaj napięcia znamionowego, unikaj uszkodzeń mechanicznych, regularnie czyść z kurzu, zapobiegaj przegrzaniu. Przy prawidłowym użytkowaniu żywotność może osiągnąć do 10 lat.",
  delivery_1_q: "Jak przebiega dostawa w Europie?",
  delivery_1_a: "Dostawa jest bezpłatna w całej Europie, ponieważ koszt jest już wliczony w cenę produktu. Korzystamy z niezawodnych firm transportowych DPD i GLS do dostawy. Czas dostawy wynosi 3-7 dni roboczych w zależności od kraju. Każde zamówienie jest starannie pakowane dla bezpiecznego transportu. Status dostawy możesz śledzić poprzez swoje konto osobiste lub numer przesyłki.",
  delivery_2_q: "Dlaczego dostawa jest bezpłatna?",
  delivery_2_a: "Uwzględniliśmy koszt dostawy w cenie każdego produktu, aby proces zakupu był jak najbardziej przejrzysty i wygodny dla naszych klientów. Pozwala to od razu zobaczyć ostateczną cenę produktu bez dodatkowych kosztów dostawy, niezależnie od kraju dostawy w Europie. To podejście również upraszcza proces zamawiania i czyni nasze ceny bardziej konkurencyjnymi.",
  delivery_3_q: "Do których krajów dostarczacie?",
  delivery_3_a: "Dostarczamy do wszystkich krajów Unii Europejskiej, a także do Wielkiej Brytanii, Szwajcarii i Norwegii. Czasy dostawy mogą się różnić w zależności od kraju: Czechy - 1-2 dni, kraje sąsiednie (Słowacja, Polska, Niemcy, Austria) - 2-4 dni, inne kraje UE - 3-7 dni. Dostawa jest pod drzwi.",
  delivery_4_q: "Jak mogę śledzić moje zamówienie?",
  delivery_4_a: "Po wysłaniu zamówienia otrzymasz e-mail z numerem śledzenia. Używając tego numeru, możesz śledzić ruch paczki na stronie internetowej firmy transportowej (DPD lub GLS). Ponadto nasz menedżer poinformuje Cię o kluczowych etapach dostawy: potwierdzenie zamówienia, przekazanie do służby dostawczej, oczekiwana data dostawy.",
  delivery_5_q: "Jakie dokumenty są dostarczane z przesyłką?",
  delivery_5_a: "Z każdym zamówieniem otrzymujesz pełen zestaw dokumentów: kartę gwarancyjną, instrukcję instalacji w Twoim języku, paragon sprzedaży. Dla firm dostarczamy wszystkie niezbędne dokumenty księgowe, w tym fakturę. Cała dokumentacja jest dostarczana w języku kraju dostawy lub w języku angielskim na żądanie.",
  delivery_6_q: "Jak produkt jest pakowany do dostawy?",
  delivery_6_a: "Używamy specjalnych opakowań ochronnych: każdy zestaw jest umieszczony w wytrzymałym pudełku z wkładkami amortyzującymi chroniącymi przed uderzeniami i wibracjami. Taśma LED i komponenty elektroniczne są dodatkowo chronione antyelektrostatycznymi workami. Opakowanie zewnętrzne ma warstwę wodoodporną i oznaczenie \"Kruche!\". Wszystkie komponenty są bezpiecznie przymocowane wewnątrz pudełka.",
  delivery_7_q: "Co zrobić, jeśli produkt dotrze uszkodzony?",
  delivery_7_a: "W mało prawdopodobnym przypadku otrzymania uszkodzonego towaru: 1) Natychmiast udokumentuj uszkodzenie zdjęciami/filmem i zaznacz to w dokumencie dostawy. 2) Skontaktuj się z nami telefonicznie lub e-mailem w ciągu 24 godzin. 3) Zorganizujemy bezpłatny zwrot i wymianę produktu. Wszystkie koszty zwrotu i wymiany pokrywamy my. Wymiana odbywa się jak najszybciej, zazwyczaj w ciągu 1-3 dni roboczych.",
  delivery_8_q: "Czy możliwa jest dostawa ekspresowa?",
  delivery_8_a: "Tak, możemy zorganizować dostawę ekspresową dla pilnych zamówień. W Pradze dostępna jest dostawa tego samego dnia dla zamówień złożonych przed 12:00. Dla innych miast w Czechach i krajów sąsiednich możliwa jest dostawa następnego dnia. Koszt dostawy ekspresowej jest wliczony w cenę produktu. Aby sprawdzić dostępność dostawy ekspresowej w Twoim regionie, skontaktuj się z nami."
};

function updateFAQSection(filePath, questions, langCode) {
  const content = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(content);

  // Add the questions section to the existing FAQ object
  if (!data.faq) {
    data.faq = {
      title: "",
      search_placeholder: "",
      categories: {}
    };
  }

  data.faq.questions = questions;

  // Write back with proper formatting
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`✓ Added FAQ questions section to ${langCode}.json`);
}

const localesDir = join(__dirname, '..', 'src', 'i18n', 'locales');

// Update FAQ sections in all three language files
updateFAQSection(join(localesDir, 'cz.json'), czQuestions, 'cz');
updateFAQSection(join(localesDir, 'de.json'), deQuestions, 'de');
updateFAQSection(join(localesDir, 'pl.json'), plQuestions, 'pl');

console.log('\n✅ FAQ questions translations added successfully for all languages!');
