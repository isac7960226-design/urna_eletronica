
public class Urna_Escolar {

    static class Chapa {

        String nome;
        int numero;
    }

    public static void main(String[] args) {
        Chapa chapa1 = new Chapa();
        chapa1.nome = "Inovacao";
        chapa1.numero = 10;

        Chapa chapa2 = new Chapa();
        chapa2.nome = "Futuro";
        chapa2.numero = 20;

        Chapa chapa3 = new Chapa();
        chapa3.nome = "Transformacao";
        chapa3.numero = 30;

        System.out.println("Candidato 1: " + chapa1.nome + " - Número: " + chapa1.numero);
        System.out.println("Candidato 2: " + chapa2.nome + " - Número: " + chapa2.numero);
        System.out.println("Candidato 3: " + chapa3.nome + " - Número: " + chapa3.numero);
    }
}
