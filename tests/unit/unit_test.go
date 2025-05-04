package unit

import (
	"encoding/json"
	"sort"
	"testing"

	"github.com/ashuthe1/streamx/models"
)

func TestPasswordHashingAndCompare(t *testing.T) {
	u := &models.User{Username: "x"}
	u.SetPassword("abc")
	if err := u.ComparePassword("abc"); err != nil {
		t.Error("compare failed")
	}
	if err := u.ComparePassword("wrong"); err == nil {
		t.Error("unexpected pass")
	}
}

func TestChatEventJSONMarshalUnmarshal(t *testing.T) {
	input := `{"type":"msg","chat":{"id":1,"from":"a","to":"b","message":"hi"}}`
	var ev models.ChatEvent
	if err := json.Unmarshal([]byte(input), &ev); err != nil {
		t.Error("fail unmarshal")
	}
	out, _ := json.Marshal(ev)
	if string(out) == "" {
		t.Error("empty marshal")
	}
}

func TestActivityEventJSON(t *testing.T) {
	ev := models.ActivityEvent{Id: 5, Type: "t", Username: "u", Action: "a", Timestamp: 123, Details: "d"}
	data, _ := json.Marshal(ev)
	var ev2 models.ActivityEvent
	json.Unmarshal(data, &ev2)
	if ev2.Id != 5 || ev2.Type == "" {
		t.Error("bad activity")
	}
}

func TestContactListStruct(t *testing.T) {
	cl := models.ContactList{Username: "c", LastActivity: 999}
	b, _ := json.Marshal(cl)
	var cl2 models.ContactList
	json.Unmarshal(b, &cl2)
	if cl2.LastActivity != 999 {
		t.Error("bad contact")
	}
}

func TestMyMessageTimestamp(t *testing.T) {
	m := models.MyMessage{Id: 2, From: "f", To: "t", Timestamp: 111}
	b, _ := json.Marshal(m)
	var m2 models.MyMessage
	json.Unmarshal(b, &m2)
	if m2.Timestamp != 111 {
		t.Error("ts wrong")
	}
}

func DecryptMessage(ciphertext, key, iv []byte) ([]byte, error) {
	if len(ciphertext) == 0 || len(key) == 0 || len(iv) == 0 {
		return nil, nil
	}
	return ciphertext, nil
}

func TestUserPublicKeyField(t *testing.T) {
	u := &models.User{PublicKey: []byte{1, 2, 3}}
	if len(u.PublicKey) != 3 {
		t.Error("pubkey len")
	}
}

func TestDecryptEmptyMessage(t *testing.T) {
	type args struct {
		ciphertext []byte
		key        []byte
		iv         []byte
	}
	tests := []struct {
		name    string
		args    args
		wantErr bool
	}{
		{
			name:    "all empty",
			args:    args{ciphertext: []byte{}, key: []byte{}, iv: []byte{}},
			wantErr: true,
		},
		{
			name:    "cipher empty",
			args:    args{ciphertext: []byte{}, key: []byte("0123456789abcdef"), iv: []byte("abcdef012345")},
			wantErr: true,
		},
		{
			name:    "key empty",
			args:    args{ciphertext: []byte{0x01, 0x02}, key: []byte{}, iv: []byte("abcdef012345")},
			wantErr: true,
		},
		{
			name:    "iv empty",
			args:    args{ciphertext: []byte{0x01, 0x02}, key: []byte("0123456789abcdef"), iv: []byte{}},
			wantErr: true,
		},
	}
	for i, tt := range tests {
		t.Logf("Case %d: %s", i+1, tt.name)
		// assume DecryptMessage exists: func([]byte, []byte, []byte) ([]byte, error)
		_, err := DecryptMessage(tt.args.ciphertext, tt.args.key, tt.args.iv)
		if (err != nil) != tt.wantErr {
			t.Fatalf("DecryptMessage() error = %v, wantErr %v", err, tt.wantErr)
		}
	}
}

func TestExtraCaseThree(t *testing.T) {
	contacts := []models.ContactList{
		{Username: "a", LastActivity: 100},
		{Username: "b", LastActivity: 50},
		{Username: "c", LastActivity: 150},
	}
	sort.Slice(contacts, func(i, j int) bool {
		return contacts[i].LastActivity > contacts[j].LastActivity
	})
	if contacts[0].Username != "c" || contacts[2].Username != "b" {
		t.Errorf("expected sorted c,a,b; got %v", contacts)
	}
}
