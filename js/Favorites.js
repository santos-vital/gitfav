import { GithubUser } from "./GithubUser.js"; 

// class that will contain the data logic
// how the data will be structured
export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.load();
  }

  load() {
    this.users = JSON.parse(localStorage.getItem('@github-favorites:')) || [];
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.users))
  }

  async add(username) {
    try {
      const userExists = this.users.find(entry => entry.login === username);

      if(userExists) {
        throw new Error('Usuário já cadastrado!')
      }

      const user = await GithubUser.search(username)
      console.log(user)
      if(user.login === undefined || user.name === null) {
        throw new Error('Usuário não encontrado!')
      }

      this.users = [user, ...this.users];
      this.update();
      this.save();
    } catch (error) {
      alert(error.message)
    }
  }

  delete(user) {
    const filteredUsers = this.users
    .filter(entry => entry.login !== user.login)
    
    this.users = filteredUsers;
    this.update();
    this.save();
  }
}

// class that will create the HTML view and events
export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody');
    
    this.update();
    this.onadd();
  }

  removeRowNoFavorites() {
		this.tbody.querySelectorAll("tr.rowNoFavorites").forEach((tr) => {
			tr.remove();
		});
	}

  onadd() {
    const addButton = this.root.querySelector('.search button');
    addButton.onclick = () => {
      const { value } = this.root.querySelector('.search input')

      this.add(value)
    }
  }

  update() {
    this.removeAllTr();
    this.toggleHaveFavorite();

    this.removeRowNoFavorites();
    this.users.forEach(user => {
      const row = this.createRow()
      
      row.querySelector('.user img').src = `https://github.com/${user.login}.png`;
      row.querySelector('.user img').alt = `Imagem de ${user.name}` 
      row.querySelector('.user a').href = `http://github.com/${user.login}`;
      row.querySelector('.user p').textContent = user.name;
      row.querySelector('.user span').textContent = "/" + user.login
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Tem certeza que deseja deletar essa linha?')

        if(isOk) {
          this.delete(user)
        }
      }
      
      this.tbody.append(row)
    })
  }

  createRow() {
    const tr = document.createElement('tr');

    tr.innerHTML = `
        <td class="user">
          <img src="https://github.com/maykbrito.png" alt="Imagem de maykbrito">
          <a href="https://github.com/maykbrito" target="_blank">
            <p>Mayk Brito</p>
            <span>maykbrito</span>
          </a>
        </td>
        <td class="repositories">
          76
        </td>
        <td class="followers">
          9589
        </td>
        <td>
          <button class="remove">Remover</button>
        </td>
    `;

    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach((tr) => {
      tr.remove();
    })
  }

  toggleHaveFavorite() {
    const noneHaveFavoriteDiv = this.root.querySelector('.noneHaveFavorites')
    const tableWithRow = this.root.querySelector('.tableWithRow')
    
    if (this.users.length === 0) {
      noneHaveFavoriteDiv.classList.remove("hide");
      tableWithRow.classList.add("tableNoRow")
    } else {
      noneHaveFavoriteDiv.classList.add("hide");
      tableWithRow.classList.remove("tableNoRow")
    }
  }
}