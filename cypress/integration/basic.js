describe('My First Test', function() {
    it('Does not do much!', function() {
        let windowWidth = Cypress.config().viewportWidth;
        let windowHeight = Cypress.config().viewportHeight;

        cy.visit('http://localhost:3000/');
        cy.wait(500);

        cy.get('input#login').type('sex');
        cy.get('input#password').type('rock');
        cy.contains('Auth').should('be.visible').click({ force: true });
        cy.wait(250);

        cy.get('input#login').should('have.class', 'error');
        cy.get('input#password').should('have.class', 'error');

        cy.get('input#login').clear();
        cy.get('input#password').clear();
        cy.get('input#login').type('root');
        cy.get('input#password').type('1234');
        cy.contains('Auth').should('be.visible').click({ force: true });
        cy.wait(750);

        cy.get('body').find('.logout').should('be.visible');

        cy.wait(250);

        // Slide right
        cy.get('body').trigger('mousedown', windowWidth / 2, windowHeight / 2, { which: 1 }).wait(250)
            .trigger('mousemove', windowWidth / 2 - 200, windowHeight / 2).wait(250)
            .trigger('mouseup', {force: true}).wait(500);

        // Slide left
        cy.get('body').trigger('mousedown', windowWidth / 2, windowHeight / 2, { which: 1 }).wait(250)
            .trigger('mousemove', windowWidth / 2 + 200, windowHeight / 2).wait(250)
            .trigger('mouseup', {force: true}).wait(500);
    })
});