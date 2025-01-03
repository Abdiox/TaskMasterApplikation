import React from "react";
import { StyleSheet, Text, ScrollView } from "react-native";

const OmTaskMaster = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Om TaskMaster</Text>

      <Text style={styles.text}>
        Velkommen til TaskMaster! En app skabt af CEO's Abdi & Mads, der har til formål at hjælpe tømrerfirmaer med at holde styr på og uddelegere
        opgaver på en nem og effektiv måde.
      </Text>

      <Text style={styles.subHeader}>Vores rejse med TaskMaster</Text>
      <Text style={styles.text}>
        Som udviklere har Mads og jeg altid været passionerede omkring teknologi og hvordan den kan bruges til at løse problemer i den virkelige
        verden. En dag blev vi kontaktet af et tømrerfirma, der havde svært ved at organisere deres arbejdsopgaver og kommunikere effektivt internt.
        De brugte gamle metoder som papir og regneark, hvilket ofte førte til forvirring og fejl. Det var her, idéen om TaskMaster blev født.
      </Text>

      <Text style={styles.text}>
        Vi så en mulighed for at skabe en app, der kunne forenkle opgavestyring og forbedre kommunikationen mellem tømrermedarbejderne. Målet var
        klart: en platform, hvor firmaet nemt kunne tildele opgaver, få opdateringer i realtid og sørge for, at alle vidste præcist, hvad der skulle
        gøres.
      </Text>

      <Text style={styles.subHeader}>Hvordan TaskMaster fungerer</Text>
      <Text style={styles.text}>
        TaskMaster er bygget med brugervenlighed i fokus. Vi designede appen, så tømrermedarbejdere og ledere kunne oprette opgaver, tildele dem til
        de rette personer, og følge med i, hvordan arbejdet skrider frem. Fra den lille arbejdsopgave til større projekter, gør TaskMaster det nemt at
        få et overblik og sikre, at ingen opgave bliver glemt.
      </Text>

      <Text style={styles.text}>
        Vi har integreret funktioner, der giver brugerne mulighed for at tilføje noter, billeder og deadlines til hver opgave. Det sikrer, at
        tømrermedarbejderne har al den nødvendige information lige ved hånden. Derudover har vi skabt et system, hvor alle opgaver automatisk
        synkroniseres, så alle på holdet har de nyeste opdateringer.
      </Text>

      <Text style={styles.subHeader}>Hvordan vi gjorde det muligt</Text>
      <Text style={styles.text}>
        Som et team kombinerede Mads og jeg vores færdigheder og erfaringer. Mads, der har stor erfaring med backendudvikling, satte sig for at skabe
        en stabil og sikker database, der kunne håndtere alle opgaver og brugernes data. Jeg tog mig af frontendudviklingen og designet appens
        brugergrænseflade, så den blev så intuitiv som muligt, selv for de, der ikke er vant til teknologi.
      </Text>

      <Text style={styles.text}>
        Efter mange timer med planlægning, design og testning, kunne vi stolt lancere TaskMaster for tømrerfirmaet, og det har siden været en stor
        succes. Firmaet har rapporteret om markante forbedringer i deres opgavehåndtering og har nu en platform, der gør deres arbejdsdag mere
        struktureret og produktiv.
      </Text>

      <Text style={styles.subHeader}>Fremtiden for TaskMaster</Text>
      <Text style={styles.text}>
        Vi er ikke færdige endnu! Mads og jeg har allerede mange ideer til, hvordan TaskMaster kan udvikles yderligere. Vi ser frem til at tilføje nye
        funktioner, som gør det endnu lettere for tømrerfirmaer at administrere deres opgaver. Det er kun begyndelsen på vores rejse med TaskMaster,
        og vi er glade for at kunne hjælpe håndværksbranchen med at blive endnu mere effektiv.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F0F4F8",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  subHeader: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
    marginBottom: 10,
  },
});

export default OmTaskMaster;
