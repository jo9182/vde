describe('My First Test', function() {
    it('Does not do much!', function() {
        cy.visit('http://localhost:3000/');
        cy.wait(1000);

        cy.get('input#login').type('sex');
        cy.get('input#password').type('rock');
        cy.contains('Auth').should('be.visible').click({ force: true });
        cy.wait(500);

        cy.get('input#login').should('have.class', 'error');
        cy.get('input#password').should('have.class', 'error');

        cy.get('input#login').clear();
        cy.get('input#password').clear();
        cy.get('input#login').type('root');
        cy.get('input#password').type('1234');
        cy.contains('Auth').should('be.visible').click({ force: true });
        cy.wait(1200);

        cy.get('body').find('.logout').should('be.visible');
    })
});