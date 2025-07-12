"""
Serviço de automação do CRM
"""
from models.automation import AutomationRule, AutomationAction, EmailCampaign
from models.user import db
import uuid
from datetime import datetime

class AutomationEngine:
    """Engine de automação para executar regras e ações"""
    
    @staticmethod
    def execute_rule(rule_id, tenant_id):
        """Executa uma regra de automação"""
        try:
            rule = AutomationRule.query.filter_by(id=rule_id, tenant_id=tenant_id).first()
            if not rule:
                return {'success': False, 'message': 'Regra não encontrada'}
            
            if not rule.is_active:
                return {'success': False, 'message': 'Regra está inativa'}
            
            # Atualizar estatísticas
            rule.execution_count += 1
            rule.last_executed_at = datetime.utcnow()
            
            try:
                # Simular execução da regra
                print(f"🤖 Executando regra de automação {rule_id}")
                
                rule.success_count += 1
                db.session.commit()
                
                return {'success': True, 'message': 'Regra executada com sucesso'}
                
            except Exception as e:
                rule.error_count += 1
                db.session.commit()
                return {'success': False, 'message': f'Erro na execução: {str(e)}'}
            
        except Exception as e:
            return {'success': False, 'message': f'Erro na execução da regra: {str(e)}'}
    
    @staticmethod
    def validate_conditions(conditions):
        """Valida condições de uma regra"""
        try:
            print(f"🔍 Validando condições: {conditions}")
            
            # Validação básica
            if not isinstance(conditions, dict):
                return {'valid': False, 'message': 'Condições devem ser um objeto'}
            
            return {'valid': True, 'message': 'Condições válidas'}
            
        except Exception as e:
            return {'valid': False, 'message': f'Erro na validação: {str(e)}'}

class AutomationService:
    """Serviço principal de automação"""
    
    @staticmethod
    def create_automation_rule(rule_data, tenant_id, user_id):
        """Cria uma nova regra de automação"""
        try:
            rule = AutomationRule(
                id=str(uuid.uuid4()),
                name=rule_data.get('name'),
                description=rule_data.get('description', ''),
                trigger_type=rule_data.get('trigger_type'),
                trigger_conditions=rule_data.get('trigger_conditions', {}),
                filters=rule_data.get('filters', {}),
                delay_minutes=rule_data.get('delay_minutes', 0),
                priority=rule_data.get('priority', 1),
                tenant_id=tenant_id,
                created_by=user_id
            )
            
            db.session.add(rule)
            db.session.commit()
            
            return {'success': True, 'message': 'Regra criada com sucesso', 'rule': rule.to_dict()}
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': f'Erro ao criar regra: {str(e)}'}
    
    @staticmethod
    def get_automation_rules(tenant_id):
        """Obtém todas as regras de automação do tenant"""
        try:
            rules = AutomationRule.query.filter_by(tenant_id=tenant_id).all()
            return {'success': True, 'rules': [rule.to_dict() for rule in rules]}
            
        except Exception as e:
            return {'success': False, 'message': f'Erro ao obter regras: {str(e)}'}
    
    @staticmethod
    def update_automation_rule(rule_id, rule_data, tenant_id):
        """Atualiza uma regra de automação"""
        try:
            rule = AutomationRule.query.filter_by(id=rule_id, tenant_id=tenant_id).first()
            if not rule:
                return {'success': False, 'message': 'Regra não encontrada'}
            
            # Atualizar campos
            if 'name' in rule_data:
                rule.name = rule_data['name']
            if 'description' in rule_data:
                rule.description = rule_data['description']
            if 'is_active' in rule_data:
                rule.is_active = rule_data['is_active']
            if 'trigger_conditions' in rule_data:
                rule.trigger_conditions = rule_data['trigger_conditions']
            if 'filters' in rule_data:
                rule.filters = rule_data['filters']
            if 'delay_minutes' in rule_data:
                rule.delay_minutes = rule_data['delay_minutes']
            if 'priority' in rule_data:
                rule.priority = rule_data['priority']
            
            rule.updated_at = datetime.utcnow()
            db.session.commit()
            
            return {'success': True, 'message': 'Regra atualizada com sucesso', 'rule': rule.to_dict()}
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': f'Erro ao atualizar regra: {str(e)}'}
    
    @staticmethod
    def delete_automation_rule(rule_id, tenant_id):
        """Deleta uma regra de automação"""
        try:
            rule = AutomationRule.query.filter_by(id=rule_id, tenant_id=tenant_id).first()
            if not rule:
                return {'success': False, 'message': 'Regra não encontrada'}
            
            db.session.delete(rule)
            db.session.commit()
            
            return {'success': True, 'message': 'Regra deletada com sucesso'}
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': f'Erro ao deletar regra: {str(e)}'}

class CadenceService:
    """Serviço para gerenciar cadências de email"""
    
    @staticmethod
    def create_cadence(cadence_data, tenant_id, user_id):
        """Cria uma nova cadência"""
        try:
            campaign = EmailCampaign(
                id=str(uuid.uuid4()),
                name=cadence_data.get('name'),
                description=cadence_data.get('description', ''),
                subject=cadence_data.get('subject', ''),
                content=cadence_data.get('content', ''),
                sender_name=cadence_data.get('sender_name', ''),
                sender_email=cadence_data.get('sender_email', ''),
                reply_to=cadence_data.get('reply_to', ''),
                track_opens=cadence_data.get('track_opens', True),
                track_clicks=cadence_data.get('track_clicks', True),
                tenant_id=tenant_id,
                created_by=user_id
            )
            
            db.session.add(campaign)
            db.session.commit()
            
            return {'success': True, 'message': 'Cadência criada com sucesso', 'campaign': campaign.to_dict()}
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': f'Erro ao criar cadência: {str(e)}'}
    
    @staticmethod
    def execute_cadence(cadence_id, tenant_id):
        """Executa uma cadência"""
        try:
            campaign = EmailCampaign.query.filter_by(id=cadence_id, tenant_id=tenant_id).first()
            if not campaign:
                return {'success': False, 'message': 'Cadência não encontrada'}
            
            if not campaign.is_active:
                return {'success': False, 'message': 'Cadência está inativa'}
            
            # Simular execução da cadência
            print(f"🚀 Executando cadência {cadence_id}")
            
            # Atualizar estatísticas
            campaign.sent_count += 1
            db.session.commit()
            
            return {'success': True, 'message': 'Cadência executada com sucesso'}
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': f'Erro ao executar cadência: {str(e)}'}

